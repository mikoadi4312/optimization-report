import { ProcessedAmData, StaffMistakeReportPayload, StaffMistakeResumeRow, FifoDetailCounts } from '../../types';
import { parse, isValid } from 'date-fns';

interface DetailDataMap {
    phone: { dataRows: any[][], headers: string[] } | null;
    tablet: { dataRows: any[][], headers: string[] } | null;
    tv: { dataRows: any[][], headers: string[] } | null;
    speaker: { dataRows: any[][], headers: string[] } | null;
}

export const processStaffFifoMistake = (
    salesData: { dataRows: any[][]; headers: string[] },
    detailData: DetailDataMap,
    amData: ProcessedAmData
): StaffMistakeReportPayload => {
    console.log("Processing Staff FIFO Mistake Report...");
    const { dataRows: salesRows, headers: salesHeaders } = salesData;

    // Headers Identification
    const imeiIndex = salesHeaders.findIndex(h => h.toLowerCase().includes('imei'));
    const serialIndex = salesHeaders.findIndex(h => h.toLowerCase().includes('serial number'));
    const staffIndex = salesHeaders.findIndex(h => h.toLowerCase().includes('created user'));
    // Updated Store Index to look for 'create store' as prioritized, or standard store fields
    const storeIndex = salesHeaders.findIndex(h => h.toLowerCase().includes('create store') || h.toLowerCase() === 'store code' || h.toLowerCase() === 'store');
    const categoryIndex = salesHeaders.findIndex(h => h.toLowerCase().includes('sub category'));
    const transTypeIndex = salesHeaders.findIndex(h =>
        h.toLowerCase().includes('transaction type') ||
        h.toLowerCase().includes('trans type') ||
        h.toLowerCase().includes('document type')
    );
    const dateIndex = salesHeaders.findIndex(h =>
        h.toLowerCase().includes('invoice date') ||
        h.toLowerCase().includes('doc date') ||
        h.toLowerCase().includes('date')
    );

    // Pre-process Detail Data into Sets for fast lookup
    const mistakeSets = {
        phone: new Set<string>(),
        tablet: new Set<string>(),
        tv: new Set<string>(),
        speaker: new Set<string>()
    };

    const populateSet = (category: keyof typeof mistakeSets, data: { dataRows: any[][], headers: string[] } | null) => {
        if (!data) return;
        const imeiIdx = data.headers.findIndex(h => h.toLowerCase().includes('imei'));
        const serialIdx = data.headers.findIndex(h => h.toLowerCase().includes('serial number'));

        data.dataRows.forEach(row => {
            if (imeiIdx !== -1 && row[imeiIdx]) mistakeSets[category].add(String(row[imeiIdx]).trim());
            if (serialIdx !== -1 && row[serialIdx]) mistakeSets[category].add(String(row[serialIdx]).trim());
        });
    };

    populateSet('phone', detailData.phone);
    populateSet('tablet', detailData.tablet);
    populateSet('tv', detailData.tv);
    populateSet('speaker', detailData.speaker);

    // Resume Map & Helpers
    const staffMap = new Map<string, StaffMistakeResumeRow>();
    let dates: Date[] = [];

    const getCategory = (catStr: string): keyof typeof mistakeSets | null => {
        const s = catStr.toLowerCase();
        if (s.includes('phone') || s.includes('handphone')) return 'phone';
        if (s.includes('tablet') || s.includes('pad')) return 'tablet';
        if (s.includes('tv') || s.includes('televisi')) return 'tv';
        if (s.includes('speaker') || s.includes('audio')) return 'speaker';
        return null;
    };

    const getTransactionType = (typeStr: string): 'saleoutAtSupermarket' | 'co' | 'fullExchange' | 'soReturn' => {
        const s = typeStr.toLowerCase();
        if (s.includes('transfer') || s.includes('co') || s.includes('cash') || s.includes('out') || s.includes('delivery')) return 'co';
        if (s.includes('exchange') || s.includes('tukar')) return 'fullExchange';
        if (s.includes('return') || s.includes('retur')) return 'soReturn';
        return 'saleoutAtSupermarket'; // Default to SALE
    };

    salesRows.forEach(row => {
        // 1. Identify Items
        const imei = imeiIndex !== -1 ? String(row[imeiIndex] || '').trim() : '';
        const serial = serialIndex !== -1 ? String(row[serialIndex] || '').trim() : '';
        const key = imei || serial;
        if (!key) return; // Must have ID

        // 2. Identify Staff
        const staffName = staffIndex !== -1 ? String(row[staffIndex] || 'Unknown').trim() : 'Unknown';
        if (!staffName || staffName.toLowerCase() === 'system') return;

        // 3. Identify Store & AM (New Logic)
        // User Requirement: 
        // 1. Look at 'Create Store' in Sales Data.
        // 2. Match to 'Store Code' in AM Data.
        // 3. Get 'Store Name' from AM Data.
        // 4. Get 'AM Name' from AM Data (via Store Name/Code).

        let storeName = 'Unknown';
        let amName = 'Unknown';

        if (storeIndex !== -1) {
            const rawStoreValue = String(row[storeIndex] || '').trim();
            // Assuming 'Create Store' might contain "Code - Name" or just "Code". 
            // We attempt to match by Code first.
            const potentialCode = rawStoreValue.split(' - ')[0].trim();

            // Lookup Name by Code
            if (amData.codeToName.has(potentialCode)) {
                storeName = amData.codeToName.get(potentialCode)!;
            } else if (amData.codeToName.has(rawStoreValue)) {
                storeName = amData.codeToName.get(rawStoreValue)!;
            } else {
                // Fallback: If no match, check if the raw value itself is a name in nameToCode?
                // Or just use the raw value if logic fails
                storeName = rawStoreValue;
            }

            // Lookup AM by Code (preferred)
            if (amData.codeToAm.has(potentialCode)) {
                amName = amData.codeToAm.get(potentialCode)!;
            } else if (amData.codeToAm.has(rawStoreValue)) {
                amName = amData.codeToAm.get(rawStoreValue)!;
            } else {
                // Try looking up code from the resolved storeName
                const code = amData.nameToCode.get(storeName);
                if (code && amData.codeToAm.has(code)) {
                    amName = amData.codeToAm.get(code)!;
                }
            }
        }

        // 4. Identify Category
        const categoryStr = categoryIndex !== -1 ? String(row[categoryIndex] || '').trim() : '';
        const category = getCategory(categoryStr);
        if (!category) return;

        // 5. Check if it IS a mistake (must exist in mistake sets)
        if (!mistakeSets[category].has(key)) return; // Iterate only through mistakes

        // 6. Identify Mistake Type
        const transTypeStr = transTypeIndex !== -1 ? String(row[transTypeIndex] || '').trim() : 'Sale';
        const mistakeType = getTransactionType(transTypeStr);

        // 7. Track Dates
        if (dateIndex !== -1 && row[dateIndex]) {
            // Try parsing date
            let dateObj = row[dateIndex];
            if (!(dateObj instanceof Date)) {
                // Try excel serial
                if (typeof dateObj === 'number') {
                    dateObj = new Date(Math.round((dateObj - 25569) * 86400 * 1000));
                } else {
                    dateObj = new Date(dateObj);
                }
            }
            if (isValid(dateObj)) dates.push(dateObj);
        }


        // 8. Initialize Row if needed
        const compositeKey = staffName.toUpperCase(); // Group by Staff Name only, as per new table layout (NO Store/AM columns visible)
        if (!staffMap.has(compositeKey)) {
            staffMap.set(compositeKey, {
                no: 0,
                am: amName,
                storeName: storeName,
                staffName: staffName.toUpperCase(),
                phone: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                tablet: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                tv: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                speaker: { saleoutAtSupermarket: 0, co: 0, fullExchange: 0, soReturn: 0, total: 0 },
                total: 0,
                totalActualSales: 0, // Not displayed in new table but kept for type compatibility
                status: ''
            });
        }

        const entry = staffMap.get(compositeKey)!;

        // 9. Increment Counts
        entry[category][mistakeType]++;
        entry[category].total++;
        entry.total++;
        // Update Status
        entry.status = entry.total > 10 ? 'Urgent' : '';
    });

    console.log(`[StaffFifo] Processed ${salesRows.length} sales rows.`);
    console.log(`[StaffFifo] Mistake Matches found:`, {
        phone: mistakeSets.phone.size > 0 ? 'Has Data' : 'Empty',
        tablet: mistakeSets.tablet.size > 0 ? 'Has Data' : 'Empty',
        tv: mistakeSets.tv.size > 0 ? 'Has Data' : 'Empty',
        speaker: mistakeSets.speaker.size > 0 ? 'Has Data' : 'Empty'
    });
    console.log(`[StaffFifo] Results count: ${staffMap.size}`);
    if (staffMap.size === 0) {
        console.warn("[StaffFifo] No results found. Possible reasons: No matching IMEI/Serial in mistake sets, or header mismatch.");
        console.log("Headers found:", salesHeaders);
        // console.log("Sample Mistake Key (Phone):", Array.from(mistakeSets.phone)[0]);
    }

    // Convert to Array, Sort by Total Descending, & Assign Numbers
    const data: StaffMistakeResumeRow[] = Array.from(staffMap.values())
        .sort((a, b) => b.total - a.total)
        .map((row, index) => {
            row.no = index + 1;
            return row;
        });

    // Date Range
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    if (dates.length > 0) {
        minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    }

    return {
        data,
        minDate,
        maxDate
    };
};
