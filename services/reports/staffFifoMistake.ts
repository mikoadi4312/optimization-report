import { ProcessedAmData, StaffMistakeReportPayload, StaffMistakeResumeRow, FifoDetailCounts } from '../../types';
import { parse, isValid } from 'date-fns';

interface DetailDataMap {
    phone: { dataRows: any[][], headers: string[] } | null;
    tablet: { dataRows: any[][], headers: string[] } | null;
    tv: { dataRows: any[][], headers: string[] } | null;
    speaker: { dataRows: any[][], headers: string[] } | null;
}

interface SalesLookup {
    staffName: string;
    storeName: string;
    amName: string;
    date: Date | null;
    transType: 'saleoutAtSupermarket' | 'co' | 'fullExchange' | 'soReturn';
}

export const processStaffFifoMistake = (
    salesData: { dataRows: any[][]; headers: string[] },
    detailData: DetailDataMap,
    amData: ProcessedAmData
): StaffMistakeReportPayload => {
    console.log("Processing Staff FIFO Mistake Report (Detail-First Strategy)...");
    const { dataRows: salesRows, headers: salesHeaders } = salesData;

    // --- 1. Header Identification (Sales Data) ---
    const lowerHeaders = salesHeaders.map(h => h.toLowerCase());
    const findHeader = (keywords: string[]) => lowerHeaders.findIndex(h => keywords.some(k => h.includes(k)));

    const imeiIndex = findHeader(['imei', 'serial number', 'sn', 'serial_no']);
    // Staff: prioritizing explicit 'user' or 'sales' fields. Added 'salesman name', 'employee', 'nama staff'
    const staffIndex = findHeader(['user create', 'created user', 'sales person', 'salesman', 'promoter', 'dibuat oleh', 'staff', 'sales', 'pembuat', 'nama sales', 'created by']);
    // Store: Added 'store id', 'nama toko', 'kd toko'
    const storeIndex = findHeader(['create store', 'store code', 'store name', 'toko', 'cabang', 'store', 'store id', 'kd toko', 'nama toko']);
    const transTypeIndex = findHeader(['transaction type', 'trans type', 'tipe transaksi', 'document type', 'tipe dokumen']);
    const dateIndex = findHeader(['invoice date', 'doc date', 'date', 'tanggal', 'tgl faktur']);

    // DEBUG: Log found indices to help user debug missing data
    console.log("Header Detection Debug:");
    console.log(`IMEI Index: ${imeiIndex} (${imeiIndex !== -1 ? salesHeaders[imeiIndex] : 'NOT FOUND'})`);
    console.log(`Staff Index: ${staffIndex} (${staffIndex !== -1 ? salesHeaders[staffIndex] : 'NOT FOUND'})`);
    console.log(`Store Index: ${storeIndex} (${storeIndex !== -1 ? salesHeaders[storeIndex] : 'NOT FOUND'})`);
    console.log(`Trans Type Index: ${transTypeIndex} (${transTypeIndex !== -1 ? salesHeaders[transTypeIndex] : 'NOT FOUND'})`);


    // --- 2. Build Sales Lookup Map ---
    // Map<IMEI, SalesLookup>
    // Strategy: Iterate all sales, map IMEI to the transaction details. 
    // If duplicates exist, latest one usually prevails, but for FIFO mistakes, we just need *a* match.
    const salesMap = new Map<string, SalesLookup>();

    const getTransactionType = (typeStr: string): 'saleoutAtSupermarket' | 'co' | 'fullExchange' | 'soReturn' => {
        const s = typeStr.toLowerCase().trim();

        // Exact mapping based on user image
        const saleoutKeywords = [
            'erablue- export change warranty installment goods at the store',
            'erablue- export warranty change at the store',
            'xuất bán hàng tại siêu thị',
            'xuất bán hàng online tại siêu thị',
            'xuất bán hàng trả góp tại siêu thị'
        ];

        // Check Saleout first (most specific long strings)
        if (saleoutKeywords.some(k => s.includes(k))) return 'saleoutAtSupermarket';

        // Check CO
        if (s.includes('xuất chuyển kho')) return 'co';

        // Check FULL EXCHANGE
        if (s.includes('xuất đổi hàng')) return 'fullExchange';

        // Check SO Return
        if (s.includes('xuất hàng ký gửi tạm')) return 'soReturn';

        // Fallback for older data or variations, but try to remain strict if possible.
        // If it doesn't match above, the previous logic defaulted to saleoutAtSupermarket.
        // Let's keep a safer default but maybe log it? For now, default to saleout as per previous behavior is safest.
        return 'saleoutAtSupermarket';
    };

    salesRows.forEach(row => {
        const imeiRaw = imeiIndex !== -1 ? row[imeiIndex] : null;
        if (!imeiRaw) return;

        // Normalize IMEI: remove whitespace, handle leading quotes if any
        const imei = String(imeiRaw).trim().replace(/^'/, '');
        if (!imei) return;

        // Extract Staff
        let staffName = 'Unknown';
        if (staffIndex !== -1 && row[staffIndex]) {
            staffName = String(row[staffIndex]).trim();
        }
        if (staffName.toLowerCase() === 'system') return; // Skip system auto-generated transactions if desired, or keep them? User usually filters them.

        // Extract Store & AM
        let storeName = 'Unknown';
        let amName = 'Unknown';
        const rawStoreValue = storeIndex !== -1 ? String(row[storeIndex] || '').trim() : '';

        if (rawStoreValue) {
            // Attempt Code extraction
            const potentialCode = rawStoreValue.split(' - ')[0].trim();

            // Resolve Store Name
            if (amData.codeToName.has(potentialCode)) storeName = amData.codeToName.get(potentialCode)!;
            else if (amData.codeToName.has(rawStoreValue)) storeName = amData.codeToName.get(rawStoreValue)!;
            else storeName = rawStoreValue;

            // Resolve AM
            if (amData.codeToAm.has(potentialCode)) amName = amData.codeToAm.get(potentialCode)!;
            else if (amData.codeToAm.has(rawStoreValue)) amName = amData.codeToAm.get(rawStoreValue)!;
            else {
                const code = amData.nameToCode.get(storeName);
                if (code && amData.codeToAm.has(code)) amName = amData.codeToAm.get(code)!;
            }
        }

        // Extract Date
        let dateObj: Date | null = null;
        if (dateIndex !== -1 && row[dateIndex]) {
            const d = row[dateIndex];
            if (d instanceof Date) dateObj = d;
            else if (typeof d === 'number') dateObj = new Date(Math.round((d - 25569) * 86400 * 1000));
            else dateObj = new Date(d);
        }

        // Extract Type
        const typeStr = transTypeIndex !== -1 ? String(row[transTypeIndex] || '').trim() : 'Sale';
        const transType = getTransactionType(typeStr);

        salesMap.set(imei, { staffName, storeName, amName, date: isValid(dateObj) ? dateObj : null, transType });
    });

    // --- 3. Process Detail Data (The Mistakes) ---
    // Iterate through provided Detail files (Phone, Tablet, etc.)
    // For each item, look up who sold it in salesMap.

    const staffMap = new Map<string, StaffMistakeResumeRow>();
    const allDates: Date[] = [];
    const categories: (keyof DetailDataMap)[] = ['phone', 'tablet', 'tv', 'speaker'];

    const getMistakeType = (typeStr: string): 'saleoutAtSupermarket' | 'co' | 'fullExchange' | 'soReturn' => {
        const s = typeStr.toLowerCase().trim();
        // Specific mapping requested by user
        if (s.includes('erablue- export warranty change at the store')) return 'saleoutAtSupermarket';
        if (s.includes('xuất bán hàng tại siêu thị')) return 'saleoutAtSupermarket';
        if (s.includes('xuất bán hàng online tại siêu thị')) return 'saleoutAtSupermarket';
        if (s.includes('xuất bán hàng trả góp tại siêu thị')) return 'saleoutAtSupermarket';
        if (s.includes('xuất chuyển kho')) return 'co';
        if (s.includes('xuất đổi hàng')) return 'fullExchange';
        if (s.includes('xuất hàng ký gửi tạm')) return 'soReturn';

        // Extra coverage for variations seen before
        if (s.includes('erablue- export change warranty installment goods at the store')) return 'saleoutAtSupermarket';

        return 'saleoutAtSupermarket';
    };

    categories.forEach(category => {
        const dataset = detailData[category];
        if (!dataset) return;

        console.log(`[StaffFifo] Inspecting ${category} file headers:`, dataset.headers);

        // Find IMEI header in Detail file
        const detHeaders = dataset.headers.map(h => h.toLowerCase());
        const detImeiIdx = detHeaders.findIndex(h => h.includes('imei') || h.includes('serial') || h.includes('sn'));

        // Find Sale Date header in Detail file
        // Added: 'invoice date', 'tgl', 'date' to capture more variations
        const detSaleDateIdx = detHeaders.findIndex(h =>
            h.includes('sale date') ||
            h.includes('tanggal') ||
            h.includes('tgl jual') ||
            h.includes('tgl') ||
            h.includes('invoice date') ||
            h === 'date'
        );

        // Find Output Type header in Detail file
        const detOutputTypeIdx = detHeaders.findIndex(h =>
            h.includes('output type') ||
            h.includes('tipe output') ||
            h.includes('jenis output') ||
            h.includes('transaction type')
        );

        if (detImeiIdx === -1) {
            console.warn(`[StaffFifo] SKIPPING ${category}: No IMEI column found. Headers seen:`, detHeaders);
            return;
        }

        if (detSaleDateIdx === -1) {
            console.warn(`[StaffFifo] SKIPPING ${category}: No 'Sale Date' column found. This is required to filter unsold items. Headers seen:`, detHeaders);
            return;
        }

        console.log(`[StaffFifo] ${category} - IMEI Col Idx: ${detImeiIdx}, SaleDate Col Idx: ${detSaleDateIdx}`);

        let processedCount = 0;
        let skippedCount = 0;

        dataset.dataRows.forEach(row => {
            // Requirement: Check if Sale Date exists and is valid
            const saleDateVal = row[detSaleDateIdx];

            // Check for empty, null, undefined, 'false', or 0. 
            // NOTE: Excel sometimes exports FALSE as a string for empty booleans or unchecked boxes.
            if (!saleDateVal || String(saleDateVal).trim() === '' || String(saleDateVal).toLowerCase() === 'false' || saleDateVal === 0) {
                skippedCount++;
                return;
            }

            const imeiRaw = row[detImeiIdx];
            if (!imeiRaw) {
                skippedCount++;
                return;
            }
            const imei = String(imeiRaw).trim().replace(/^'/, '');
            if (!imei) return;

            // LOOKUP using IMEI from Detail into Sales Data
            const salesInfo = salesMap.get(imei);

            // If found in sales map, use that staff. If not, it's unknown.
            const staffName = salesInfo ? salesInfo.staffName : 'Unknown / Data Missing';
            const storeName = salesInfo ? salesInfo.storeName : 'Unknown';
            const amName = salesInfo ? salesInfo.amName : 'Unknown';
            const outputTypeStr = detOutputTypeIdx !== -1 ? String(row[detOutputTypeIdx] || '') : '';
            const transType = getMistakeType(outputTypeStr);

            if (salesInfo && salesInfo.date) allDates.push(salesInfo.date);

            // Aggregate
            const key = staffName.toUpperCase();
            if (!staffMap.has(key)) {
                staffMap.set(key, {
                    no: 0,
                    am: amName,
                    storeName: storeName,
                    staffName: staffName.toUpperCase(),
                    phone: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                    tablet: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                    tv: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                    speaker: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                    total: 0,
                    totalActualSales: 0,
                    status: ''
                });
            }

            const entry = staffMap.get(key)!;
            entry[category][transType]++;
            entry[category].total++;
            entry.total++;
            entry.status = entry.total > 10 ? 'Urgent' : '';
            processedCount++;
        });
        console.log(`[StaffFifo] ${category} Summary: Processed ${processedCount}, Skipped ${skippedCount} unsold items.`);
    });

    console.log(`[StaffFifo] Final Staff Set size: ${staffMap.size}`);

    // --- 4. Final Formatting ---
    const data: StaffMistakeResumeRow[] = Array.from(staffMap.values())
        .filter(row => row.total > 0) // Should be all of them
        .sort((a, b) => b.total - a.total)
        .map((row, index) => {
            row.no = index + 1;
            return row;
        });

    // Calculate Date Range based on ALL Sales Data (to reflect the report period accurately)
    // Previous logic only used dates from *matched* mistakes, which caused confusing narrow ranges (e.g., 20-30 Jan).
    // User wants to see the full period of the Sales Data (e.g., 1-31 Jan).
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    // Scan all sales rows for min/max date
    salesRows.forEach(row => {
        if (dateIndex !== -1 && row[dateIndex]) {
            let dStr = row[dateIndex];
            let d: Date | null = null;
            if (dStr instanceof Date) d = dStr;
            else if (typeof dStr === 'number') d = new Date(Math.round((dStr - 25569) * 86400 * 1000));
            else d = new Date(dStr);

            if (isValid(d)) {
                const time = d.getTime();
                if (minDate === null || time < minDate.getTime()) minDate = d;
                if (maxDate === null || time > maxDate.getTime()) maxDate = d;
            }
        }
    });

    return {
        data,
        minDate,
        maxDate
    };
};
