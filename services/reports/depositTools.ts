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
        voucherReference: findHeader(['Voucher concert', 'Voucher concern', 'Voucher connect', 'Referrence']),
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
        inOutVoucher: string;
        voucherReference: string;
    }

    let allTransactions: Transaction[] = [];

    dataRows.forEach(row => {
        const customerName = String(row[headerIndices.customerName] || '').trim();
        if (!customerName) return;

        const paymentAmountRaw = String(row[headerIndices.paymentAmount] || '0');
        const amount = parseFloat(paymentAmountRaw.replace(/\./g, '').replace(",", ".")) || 0;

        const dateValue = row[headerIndices.invoucherDate];
        const date = parseUnknownDateFormat(dateValue);
        const checkDay = date ? Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24)) : 0;
        const voucherType = String(row[headerIndices.voucherType] || '').trim();
        const inOutVoucher = String(row[headerIndices.inOutVoucher] || '').trim();
        const voucherReference = headerIndices.voucherReference !== -1 ? String(row[headerIndices.voucherReference] || '').trim() : '';

        allTransactions.push({
            row,
            customerName,
            amount,
            date,
            dateValue,
            voucherType,
            checkDay,
            inOutVoucher,
            voucherReference
        });
    });

    // 2. Identify Paired/Refunded Transactions (The "Yellow" Rows Logic)
    // Rule: If a 'Refund' transaction references a 'Deposit' transaction via 'voucherReference', BOTH are excluded.
    const refundedVoucherIds = new Set<string>();

    // Pass 1: Collect IDs found in 'voucherReference' of Refund transactions
    allTransactions.forEach(tx => {
        // Check for Refund type or negative amount with a reference
        const isRefund = tx.amount < 0 || tx.voucherType.toLowerCase().includes('refund');
        if (isRefund && tx.voucherReference) {
            refundedVoucherIds.add(tx.voucherReference);
        }
    });

    // Pass 2: Filter the list
    const transactions: Transaction[] = [];

    // We also need to remove the Refund transactions that did the cancelling, 
    // so they don't double-count as debt in FIFO logic (unless that's desired? 
    // Usually if specifically refunded, both disappear).
    // Let's track which Refunds were used to cancel specific items to exclude them too.
    const usedRefundIds = new Set<string>();

    allTransactions.forEach(tx => {
        const isRefund = tx.amount < 0 || tx.voucherType.toLowerCase().includes('refund');

        if (isRefund) {
            // If this refund specifically references a known ID, we mark this refund as 'used' (excluded)
            // because it served its purpose of cancelling a specific line.
            if (tx.voucherReference && refundedVoucherIds.has(tx.voucherReference)) {
                // But wait, refundedVoucherIds comes FROM voucherReference.
                // So yes, this is a cancelling refund.
                return; // Exclude this Refund Tx
            }
        } else {
            // It's a Deposit (or positive)
            // If this ID is in the refunded list, it's cancelled.
            if (refundedVoucherIds.has(tx.inOutVoucher)) {
                return; // Exclude this Deposit Tx
            }
        }

        // If not paired, keep it for standard processing (FIFO, etc.)
        transactions.push(tx);
    });

    // 3. Group by Customer
    const customerGroups = new Map<string, Transaction[]>();
    for (const tx of transactions) {
        if (!customerGroups.has(tx.customerName)) {
            customerGroups.set(tx.customerName, []);
        }
        customerGroups.get(tx.customerName)!.push(tx);
    }

    const resultRows: DepositToolsData[] = [];

    // 4. Process FIFO (for remaining items)
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
                // Usage (Generic usage that wasn't paired above)
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

        // 5. Collect remaining deposits
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

                // Get full store name from AM data, fallback to code if not found
                const fullStoreName = amData.codeToName.get(storeCode) || storeCodeFromFile;

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

    // Post-process: Deduplicate by In/Out Voucher
    // Rule: If multiple rows have the same Voucher ID, keep only the LATEST one (smallest checkDay).
    // The user specifically mentioned that for odd numbers of duplicates (e.g. 3), 
    // we should show the latest one without modifying its date.
    // "Even" counts are expected to cancel out in FIFO, but if they remain, we still show the latest.

    const uniqueResults: DepositToolsData[] = [];
    const voucherGroups = new Map<string, DepositToolsData[]>();

    // group by Voucher ID
    for (const row of resultRows) {
        const key = row.inOutVoucher;
        if (!key) {
            // If no voucher ID (rare), keep it directly
            uniqueResults.push(row);
            continue;
        }
        if (!voucherGroups.has(key)) voucherGroups.set(key, []);
        voucherGroups.get(key)!.push(row);
    }

    // Select Latest per Group
    for (const [key, rows] of voucherGroups) {
        if (rows.length === 1) {
            uniqueResults.push(rows[0]);
        } else {
            // Sort by checkDay ASC (Smallest checkDay = Newest Date)
            // Note: checkDay = (Today - Date), so smaller is newer.
            rows.sort((a, b) => a.checkDay - b.checkDay);

            // Take the first one (Latest)
            uniqueResults.push(rows[0]);
        }
    }

    const finalProcessedRows = uniqueResults;

    const sortedData = finalProcessedRows.sort((a, b) => b.checkDay - a.checkDay);

    return sortedData;
}
