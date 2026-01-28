import { DepositToolsData, ProcessedAmData } from '../../types';
import { excelDateToJSDate, parseUnknownDateFormat } from '../utils';

export const processDepositTools = (dataRows: any[][], headers: string[], amData: ProcessedAmData): DepositToolsData[] => {
    if (!amData) throw new Error("AM Data is missing for Deposit Tools report.");

    const normalizedHeaders = headers.map(h => String(h || '').toLowerCase().trim());
    const findHeader = (possibleNames: string[]): number => {
        for (const name of possibleNames) {
            const index = normalizedHeaders.findIndex(h => h.includes(name.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    };

    const headerIndices = {
        store: findHeader(['Store']),
        inOutVoucher: findHeader(['In/out voucher', 'Invoucher']),
        customerName: findHeader(['Customer name']),
        invoucherDate: findHeader(['Invoucher date', 'Date']),
        content: findHeader(['Content']),
        voucherType: findHeader(['Voucher type']),
        paymentAmount: findHeader(['Payment amount']),
    };

    const requiredHeaders: { [key: string]: string } = {
        store: 'Store',
        inOutVoucher: 'In/out voucher or Invoucher',
        customerName: 'Customer name',
        invoucherDate: 'Invoucher date or Date',
        content: 'Content',
        voucherType: 'Voucher type',
        paymentAmount: 'Payment amount',
    };

    const missingHeaders = Object.keys(requiredHeaders).filter(
        key => headerIndices[key as keyof typeof headerIndices] === -1
    );

    if (missingHeaders.length > 0) {
        const missingHeaderNames = missingHeaders.map(key => `'${requiredHeaders[key]}'`).join(', ');
        throw new Error(`Missing required columns for Deposit Tools report: ${missingHeaderNames}.`);
    }

    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    // 1. Parse all transactions
    interface Transaction {
        row: any[];
        customerName: string;
        amount: number;
        date: Date | null;
        dateValue: any;
        voucherType: string;
        checkDay: number;
    }

    const transactions: Transaction[] = [];

    dataRows.forEach(row => {
        const customerName = String(row[headerIndices.customerName] || '').trim();
        if (!customerName) return;

        const paymentAmountRaw = String(row[headerIndices.paymentAmount] || '0');
        const amount = parseFloat(paymentAmountRaw.replace(/\./g, '').replace(",", ".")) || 0;

        const dateValue = row[headerIndices.invoucherDate];
        const date = parseUnknownDateFormat(dateValue);
        const checkDay = date ? Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24)) : 0;
        const voucherType = String(row[headerIndices.voucherType] || '').trim();

        transactions.push({
            row,
            customerName,
            amount,
            date,
            dateValue,
            voucherType,
            checkDay
        });
    });

    // 2. Group by Customer
    const customerGroups = new Map<string, Transaction[]>();
    for (const tx of transactions) {
        if (!customerGroups.has(tx.customerName)) {
            customerGroups.set(tx.customerName, []);
        }
        customerGroups.get(tx.customerName)!.push(tx);
    }

    const resultRows: DepositToolsData[] = [];

    // 3. Process FIFO
    for (const [customer, txs] of customerGroups) {
        // Sort by date (oldest first)
        txs.sort((a, b) => {
            const tA = a.date ? a.date.getTime() : 0;
            const tB = b.date ? b.date.getTime() : 0;
            return tA - tB;
        });

        const depositQueue: { tx: Transaction, remaining: number }[] = [];

        for (const tx of txs) {
            // Treat 0 as nothing?
            if (tx.amount > 0) {
                // Deposit
                depositQueue.push({ tx, remaining: tx.amount });
            } else if (tx.amount < 0) {
                // Usage
                let usage = Math.abs(tx.amount);

                while (usage > 0.01 && depositQueue.length > 0) { // 0.01 tolerance for float
                    const currentDeposit = depositQueue[0];

                    if (currentDeposit.remaining > usage) {
                        currentDeposit.remaining -= usage;
                        usage = 0;
                    } else {
                        usage -= currentDeposit.remaining;
                        currentDeposit.remaining = 0;
                        depositQueue.shift();
                    }
                }
            }
        }

        // 4. Collect remaining deposits
        for (const item of depositQueue) {
            // Filter Criteria:
            // 1. Voucher Type must be 'Erablue - Collecting sales deposits'
            // 2. Date must be older than 3 days ago
            // 3. Check Day <= 120

            // Also ensure remaining amount is significant (> 0)
            if (item.remaining > 0.01 &&
                item.tx.voucherType === 'Erablue - Collecting sales deposits' &&
                item.tx.date && item.tx.date < threeDaysAgo &&
                item.tx.checkDay <= 120) {

                const row = item.tx.row;
                const storeCodeFromFile = String(row[headerIndices.store] || '').trim();
                const storeCode = storeCodeFromFile.split(' ')[0]; // Extract just the code part

                // DEBUG: Check AM data
                console.log('DEBUG - Store code:', storeCode);
                console.log('DEBUG - codeToName size:', amData.codeToName.size);
                console.log('DEBUG - codeToName lookup:', amData.codeToName.get(storeCode));

                // Get full store name from AM data, fallback to code if not found
                const fullStoreName = amData.codeToName.get(storeCode) || storeCodeFromFile;
                console.log('DEBUG - Final store name:', fullStoreName);

                resultRows.push({
                    store: fullStoreName, // Now uses full store name from AM data
                    inOutVoucher: String(row[headerIndices.inOutVoucher] || ''),
                    customerName: item.tx.customerName,
                    date: typeof item.tx.dateValue === 'number' ? excelDateToJSDate(item.tx.dateValue, 'date') : String(item.tx.dateValue || '').split(' ')[0],
                    checkDay: item.tx.checkDay,
                    paymentAmount: item.remaining,
                    content: String(row[headerIndices.content] || ''),
                    am: amData.codeToAm.get(storeCode) || '',
                });
            }
        }
    }

    // Post-process: Handle transactions appearing > 3 times
    const voucherGroups = new Map<string, DepositToolsData[]>();
    for (const row of resultRows) {
        // Use inOutVoucher as the unique key. 
        // If necessary, we could combine with store/customer, but Voucher ID should be unique enough.
        const key = row.inOutVoucher;
        if (!key) continue; // Skip if no voucher ID
        if (!voucherGroups.has(key)) voucherGroups.set(key, []);
        voucherGroups.get(key)!.push(row);
    }

    for (const [key, rows] of voucherGroups) {
        if (rows.length > 3) {
            // Find the latest transaction (smallest checkDay)
            let minCheckDay = Infinity;
            let newestDateStr = '';

            for (const r of rows) {
                if (r.checkDay < minCheckDay) {
                    minCheckDay = r.checkDay;
                    newestDateStr = r.date;
                }
            }

            // Update all rows in this group to use the latest date
            if (newestDateStr) {
                for (const r of rows) {
                    r.date = newestDateStr;
                    r.checkDay = minCheckDay;
                }
            }
        }
    }

    const sortedData = resultRows.sort((a, b) => b.checkDay - a.checkDay);

    return sortedData;
}
