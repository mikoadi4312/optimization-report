import { DepositToolsData, ProcessedAmData } from '../../types';
import { excelDateToJSDate, parseUnknownDateFormat } from '../utils';

// Shared Transaction Interface
interface Transaction {
    row?: any[]; // Optional, kalau dari DB ga punya row asli
    customerName: string;
    amount: number;
    date: Date | null;
    dateValue: any; // String asli buat display
    voucherType: string;
    checkDay: number;
    inOutVoucher: string;
    voucherReference: string;
    content: string; // Added field
    storeCode: string; // Added field for Normalized Store Code
    fullStoreNameFromFile: string; // Asli dari file/db
}

// ---- CORE LOGIC (Agnostic to Source) ----
const calculateDepositMistakes = (allTransactions: Transaction[], amData: ProcessedAmData): DepositToolsData[] => {
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    // 1. Identify Paired/Refunded Transactions
    const refundedVoucherIds = new Set<string>();

    allTransactions.forEach(tx => {
        // Amount < 0 usually means refund/usage. Or type contains Refund.
        const isRefund = tx.amount < 0 || tx.voucherType.toLowerCase().includes('refund');
        if (isRefund && tx.voucherReference) {
            refundedVoucherIds.add(tx.voucherReference);
        }
    });

    const transactions: Transaction[] = [];

    allTransactions.forEach(tx => {
        const isRefund = tx.amount < 0 || tx.voucherType.toLowerCase().includes('refund');

        if (isRefund) {
            if (tx.voucherReference && refundedVoucherIds.has(tx.voucherReference)) {
                return; // Exclude this Refund Tx
            }
        } else {
            // Deposit
            if (refundedVoucherIds.has(tx.inOutVoucher)) {
                return; // Exclude this Deposit Tx
            }
        }
        transactions.push(tx);
    });

    // 2. Group by Customer for FIFO Logic
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
            if (tx.amount > 0) {
                depositQueue.push({ tx, remaining: tx.amount });
            } else if (tx.amount < 0) {
                let usage = Math.abs(tx.amount);
                while (usage > 0.01 && depositQueue.length > 0) {
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
            // Filter Criteria include standard text check + Date logic
            if (item.remaining > 0.01 &&
                item.tx.voucherType === 'Erablue - Collecting sales deposits' &&
                item.tx.date && item.tx.date < threeDaysAgo &&
                item.tx.checkDay <= 120) {

                // Mapping Store Code to Name using AM Data
                const storeCode = item.tx.storeCode;
                const fullStoreName = amData.codeToName.get(storeCode) || item.tx.fullStoreNameFromFile;

                resultRows.push({
                    store: fullStoreName,
                    inOutVoucher: item.tx.inOutVoucher,
                    customerName: item.tx.customerName,
                    date: typeof item.tx.dateValue === 'number' ? excelDateToJSDate(item.tx.dateValue, 'date') : String(item.tx.dateValue || '').split(' ')[0],
                    checkDay: item.tx.checkDay,
                    paymentAmount: item.remaining,
                    content: item.tx.content,
                    am: amData.codeToAm.get(storeCode) || '',
                });
            }
        }
    }

    // 5. Post-process: Deduplicate by In/Out Voucher (Keep Latest checkDay)
    const uniqueResults: DepositToolsData[] = [];
    const voucherGroups = new Map<string, DepositToolsData[]>();

    for (const row of resultRows) {
        const key = row.inOutVoucher;
        if (!key) {
            uniqueResults.push(row);
            continue;
        }
        if (!voucherGroups.has(key)) voucherGroups.set(key, []);
        voucherGroups.get(key)!.push(row);
    }

    for (const [key, rows] of voucherGroups) {
        if (rows.length === 1) {
            uniqueResults.push(rows[0]);
        } else {
            // Sort by checkDay ASC (Smallest checkDay = Newest Date relative to Today)
            rows.sort((a, b) => a.checkDay - b.checkDay);
            uniqueResults.push(rows[0]);
        }
    }

    return uniqueResults.sort((a, b) => b.checkDay - a.checkDay);
};

// ---- EXCEL PARSER ----
export const processDepositTools = (dataRows: any[][], headers: string[], amData: ProcessedAmData): DepositToolsData[] => {
    if (!amData) throw new Error("AM Data is missing for Deposit Tools report.");

    const normalizedHeaders = headers.map(h => String(h || '').toLowerCase().trim());
    const findHeader = (possibleNames: string[]): number => {
        // 1. Priority: Exact Match
        for (const name of possibleNames) {
            const index = normalizedHeaders.findIndex(h => h === name.toLowerCase());
            if (index !== -1) return index;
        }
        // 2. Fallback: Partial Match
        for (const name of possibleNames) {
            const index = normalizedHeaders.findIndex(h => h.includes(name.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    };

    const headerIndices = {
        store: findHeader(['storeid', 'store code', 'store', 'toko', 'unit bisnis']),
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
    const allTransactions: Transaction[] = [];

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
        const content = String(row[headerIndices.content] || '').trim();

        const storeCodeFromFile = String(row[headerIndices.store] || '').trim();
        const storeCode = storeCodeFromFile.split(' ')[0];

        allTransactions.push({
            row,
            customerName,
            amount,
            date,
            dateValue,
            voucherType,
            checkDay,
            inOutVoucher,
            voucherReference,
            content,
            storeCode,
            fullStoreNameFromFile: storeCodeFromFile
        });
    });

    return calculateDepositMistakes(allTransactions, amData);
};

// ---- DB PARSER ----
export const processDepositToolsFromDB = (dbRows: any[], amData: ProcessedAmData): DepositToolsData[] => {
    if (!amData) throw new Error("AM Data is missing for Deposit Tools report.");

    const today = new Date();
    const allTransactions: Transaction[] = [];

    dbRows.forEach(row => {
        // Mapping DB columns to Transaction Logic
        // DB Columns: store_code, voucher_no, customer_name, date, amount, type, reference

        const customerName = String(row.customer_name || '').trim();
        if (!customerName) return;

        const amount = Number(row.amount || 0);

        // Date parsing from ISO string (YYYY-MM-DD) or similar
        const dateValue = row.date;
        const date = dateValue ? new Date(dateValue) : null;

        const checkDay = date ? Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24)) : 0;

        // Logic Voucher Type emulation for FIFO
        // Di DB kita simpan type simpel 'DEPOSIT' atau 'REFUND'. 
        // Tapi logic FIFO butuh string spesifik "Erablue - Collecting sales deposits" biar lolos filter.
        // Jadi kita rekonstruksi.
        let voucherType = '';
        if (row.type === 'DEPOSIT') {
            voucherType = 'Erablue - Collecting sales deposits';
        } else {
            voucherType = 'Refund'; // Atau string apapun yang mengandung refund
        }

        const inOutVoucher = String(row.voucher_no || '').trim();
        const voucherReference = String(row.reference || '').trim();
        const content = String(row.content || '').trim();
        // Note: Field 'Content' di Brief tidak masuk Schema. Kita skip dulu atau ambil default.

        const storeCodeFull = String(row.store_code || '').trim();
        const storeCode = storeCodeFull.split(' ')[0]; // Split "15863 - Name" -> "15863"

        allTransactions.push({
            customerName,
            amount,
            date,
            dateValue, // Keep original string for display
            voucherType,
            checkDay,
            inOutVoucher,
            voucherReference,
            content,
            storeCode,
            fullStoreNameFromFile: row.store_code // Fallback name
        });
    });

    return calculateDepositMistakes(allTransactions, amData);
};
