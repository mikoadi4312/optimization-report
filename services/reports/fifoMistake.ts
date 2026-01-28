import { FifoMistakeRow, FifoMistakeReportPayload, ProcessedAmData, FifoWeeklySummary, FifoSummaryRow, UnderperformedCategoryData, FifoResumeData, FifoDetailCounts } from '../../types';

type DailyData = { saleOut: number; mistake: number; };
type CategoryDailyData = { [day: number]: DailyData };
type StoreMistakeData = {
    [key: string]: CategoryDailyData;
    phone: CategoryDailyData;
    tablet: CategoryDailyData;
    tv: CategoryDailyData;
    speaker: CategoryDailyData;
};

const VIETNAMESE_HEADERS = {
    storeName: 'tên kho',
    saleOut: 'sl bán',
    mistake: 'lỗi',
};

const getInitialStoreData = (): StoreMistakeData => ({
    phone: {},
    tablet: {},
    tv: {},
    speaker: {},
});

const parseNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return Math.floor(val);
    if (typeof val === 'string') {
        let strVal = val.trim();
        if (strVal === '') return 0;
        strVal = strVal.replace(/\./g, '').replace(/,/g, '.');
        const num = Math.floor(parseFloat(strVal));
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

const parseCategorySheet = (
    rows: any[][],
    category: keyof Omit<StoreMistakeData, 'storeId' | 'am'>,
    storeDataMap: Map<string, { data: StoreMistakeData }>
): number => { // Returns the max day found in the sheet headers
    if (!rows || rows.length < 2) return 0;

    let dateHeaderRow: (string | number)[] | null = null;
    let typeHeaderRow: string[] | null = null;
    let storeNameIndex = -1;
    let dataStartIndex = -1;
    let maxDayInSheet = 0;

    for (let i = 0; i < rows.length; i++) {
        const potentialTypeHeader = rows[i]?.map(h => String(h || '').trim().toLowerCase());
        const sNameIdx = potentialTypeHeader?.indexOf(VIETNAMESE_HEADERS.storeName) ?? -1;
        const sOutIdx = potentialTypeHeader?.indexOf(VIETNAMESE_HEADERS.saleOut) ?? -1;
        if (sNameIdx !== -1 && sOutIdx !== -1) {
            typeHeaderRow = potentialTypeHeader;
            storeNameIndex = sNameIdx;
            dateHeaderRow = rows[i - 1]?.map(h => h) ?? null; // Assume date is row above
            dataStartIndex = i + 1;
            break;
        }
    }

    if (!typeHeaderRow || !dateHeaderRow || dataStartIndex === -1) {
        // Fallback for simple format - cannot determine date from this format
        const headerRow = rows.find(r => r?.map(c => String(c || '').toLowerCase()).includes(VIETNAMESE_HEADERS.storeName));
        if (!headerRow) return 0;
        const headers = headerRow.map(c => String(c || '').toLowerCase());
        storeNameIndex = headers.indexOf(VIETNAMESE_HEADERS.storeName);
        const saleOutIndex = headers.indexOf(VIETNAMESE_HEADERS.saleOut);
        const mistakeIndex = headers.indexOf(VIETNAMESE_HEADERS.mistake);
        if (storeNameIndex === -1 || saleOutIndex === -1) return 0;

        // Cannot determine day from this format, so we return 0
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const day = yesterday.getDate();

        const dataRows = rows.slice(rows.indexOf(headerRow) + 1);
        dataRows.forEach(row => {
            const storeFullName = String(row[storeNameIndex] || '').trim();
            if (!storeFullName) return;
            if (!storeDataMap.has(storeFullName)) storeDataMap.set(storeFullName, { data: getInitialStoreData() });

            const storeEntry = storeDataMap.get(storeFullName)!;
            const saleOut = parseNumericValue(row[saleOutIndex]);
            const mistake = mistakeIndex !== -1 ? parseNumericValue(row[mistakeIndex]) : 0;

            if (!storeEntry.data[category][day]) storeEntry.data[category][day] = { saleOut: 0, mistake: 0 };
            storeEntry.data[category][day].saleOut += saleOut;
            storeEntry.data[category][day].mistake += mistake;
        });
        return 0; // Cannot reliably get max day from simple format
    }

    const columnMap = new Map<number, { day: number, type: 'saleOut' | 'mistake' }>();
    let currentDay = 0;
    for (let c = storeNameIndex + 1; c < typeHeaderRow.length; c++) {
        const dateCell = dateHeaderRow[c];
        if (dateCell) {
            const dayMatch = String(dateCell).match(/^(\d+)/);
            if (dayMatch) {
                currentDay = parseInt(dayMatch[1], 10);
                if (currentDay > maxDayInSheet) {
                    maxDayInSheet = currentDay;
                }
            }
        }
        const typeCell = typeHeaderRow[c];
        if (typeCell === VIETNAMESE_HEADERS.saleOut) columnMap.set(c, { day: currentDay, type: 'saleOut' });
        else if (typeCell === VIETNAMESE_HEADERS.mistake) columnMap.set(c, { day: currentDay, type: 'mistake' });
    }

    for (let i = dataStartIndex; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.every(cell => cell === null || String(cell).trim() === '')) continue;
        const storeFullName = String(row[storeNameIndex] || '').trim();
        if (!storeFullName) continue;

        if (!storeDataMap.has(storeFullName)) storeDataMap.set(storeFullName, { data: getInitialStoreData() });
        const storeEntry = storeDataMap.get(storeFullName)!;

        for (const [colIndex, { day, type }] of columnMap.entries()) {
            if (!day) continue;
            const value = parseNumericValue(row[colIndex]);
            if (!storeEntry.data[category][day]) storeEntry.data[category][day] = { saleOut: 0, mistake: 0 };
            storeEntry.data[category][day][type] += value;
        }
    }
    return maxDayInSheet;
};

const getWeeksOfMonth = (year: number, month: number): { start: number; end: number }[] => {
    const weeks: { start: number; end: number }[] = [];
    let startDate = 1;
    const lastDate = new Date(year, month + 1, 0).getDate();

    while (startDate <= lastDate) {
        // new Date month is 0-indexed. getDay() is 0 for Sunday.
        const d = new Date(year, month, startDate);
        const startDayOfWeek = d.getDay();

        // 0=Sun, 1=Mon, ..., 6=Sat
        const daysUntilSunday = startDayOfWeek === 0 ? 0 : 7 - startDayOfWeek;
        let endDate = startDate + daysUntilSunday;
        endDate = Math.min(endDate, lastDate);

        weeks.push({ start: startDate, end: endDate });
        startDate = endDate + 1;
    }
    return weeks;
};

const calculateSummary = (
    storeDataMap: Map<string, { data: StoreMistakeData }>,
    amData: ProcessedAmData,
    codeToGO: Map<string, Date>,
    startDate: number,
    endDate: number,
    reportDate: Date,
    includeTotalMistake: boolean
): FifoSummaryRow[] => {
    const amSummaryMap = new Map<string, Omit<FifoSummaryRow, 'am' | 'phonePercent' | 'tabletPercent' | 'tvPercent' | 'speakerPercent' | 'totalMistakePercent'>>();

    for (const [storeName, { data }] of storeDataMap.entries()) {
        let storeId = amData.nameToCode.get(storeName) || amData.nameToCode.get(storeName.toUpperCase());
        if (!storeId && amData.codeToAm.has(storeName)) storeId = storeName; // Fallback: treat name as code
        if (!storeId) continue;
        const goDate = codeToGO.get(storeId);

        // DEBUG: Check why this specific store might be skipped
        if (storeName.includes("EBS_JBR_BKSKAB_CSE_JL. Raya Cikarang (Cibarusah)") || storeId.includes("EBS_JBR_BKSKAB_CSE_JL. Raya Cikarang (Cibarusah)")) {
            console.log(`[DEBUG] Store: ${storeName}, ID: ${storeId}`);
            console.log(`[DEBUG] GO Date: ${goDate}, Report Date: ${reportDate}`);
            console.log(`[DEBUG] Is Included? ${goDate && goDate <= reportDate}`);
        }

        if (!goDate || goDate > reportDate) continue;
        const am = amData.codeToAm.get(storeId) || 'Unknown AM';

        if (!amSummaryMap.has(am)) {
            amSummaryMap.set(am, {
                phoneSaleOut: 0, phoneMistake: 0, tabletSaleOut: 0, tabletMistake: 0,
                tvSaleOut: 0, tvMistake: 0, speakerSaleOut: 0, speakerMistake: 0,
            });
        }
        const amSummary = amSummaryMap.get(am)!;

        for (let day = startDate; day <= endDate; day++) {
            amSummary.phoneSaleOut += data.phone[day]?.saleOut || 0;
            amSummary.phoneMistake += data.phone[day]?.mistake || 0;
            amSummary.tabletSaleOut += data.tablet[day]?.saleOut || 0;
            amSummary.tabletMistake += data.tablet[day]?.mistake || 0;
            amSummary.tvSaleOut += data.tv[day]?.saleOut || 0;
            amSummary.tvMistake += data.tv[day]?.mistake || 0;
            amSummary.speakerSaleOut += data.speaker[day]?.saleOut || 0;
            amSummary.speakerMistake += data.speaker[day]?.mistake || 0;
        }
    }

    const summaryData: FifoSummaryRow[] = [];
    Array.from(amSummaryMap.entries()).sort(([amA], [amB]) => amA.localeCompare(amB)).forEach(([am, data]) => {
        const phonePercent = data.phoneSaleOut > 0 ? data.phoneMistake / data.phoneSaleOut : 0;
        const tabletPercent = data.tabletSaleOut > 0 ? data.tabletMistake / data.tabletSaleOut : 0;
        const tvPercent = data.tvSaleOut > 0 ? data.tvMistake / data.tvSaleOut : 0;
        const speakerPercent = data.speakerSaleOut > 0 ? data.speakerMistake / data.speakerSaleOut : 0;

        const row: FifoSummaryRow = {
            am, ...data,
            phonePercent,
            tabletPercent,
            tvPercent,
            speakerPercent,
        };

        if (includeTotalMistake) {
            row.totalMistakePercent = phonePercent + tabletPercent + tvPercent + speakerPercent;
        }

        summaryData.push(row);
    });

    if (summaryData.length > 0) {
        const performanceRow: FifoSummaryRow = {
            am: 'PERFORMANCE',
            phoneSaleOut: 0, phoneMistake: 0, phonePercent: 0,
            tabletSaleOut: 0, tabletMistake: 0, tabletPercent: 0,
            tvSaleOut: 0, tvMistake: 0, tvPercent: 0,
            speakerSaleOut: 0, speakerMistake: 0, speakerPercent: 0,
        };
        if (includeTotalMistake) {
            performanceRow.totalMistakePercent = 0;
        }

        summaryData.forEach(row => {
            performanceRow.phoneSaleOut += row.phoneSaleOut;
            performanceRow.phoneMistake += row.phoneMistake;
            performanceRow.tabletSaleOut += row.tabletSaleOut;
            performanceRow.tabletMistake += row.tabletMistake;
            performanceRow.tvSaleOut += row.tvSaleOut;
            performanceRow.tvMistake += row.tvMistake;
            performanceRow.speakerSaleOut += row.speakerSaleOut;
            performanceRow.speakerMistake += row.speakerMistake;
        });

        performanceRow.phonePercent = performanceRow.phoneSaleOut > 0 ? performanceRow.phoneMistake / performanceRow.phoneSaleOut : 0;
        performanceRow.tabletPercent = performanceRow.tabletSaleOut > 0 ? performanceRow.tabletMistake / performanceRow.tabletSaleOut : 0;
        performanceRow.tvPercent = performanceRow.tvSaleOut > 0 ? performanceRow.tvMistake / performanceRow.tvSaleOut : 0;
        performanceRow.speakerPercent = performanceRow.speakerSaleOut > 0 ? performanceRow.speakerMistake / performanceRow.speakerSaleOut : 0;

        if (includeTotalMistake) {
            performanceRow.totalMistakePercent = performanceRow.phonePercent + performanceRow.tabletPercent + performanceRow.tvPercent + performanceRow.speakerPercent;
        }

        summaryData.push(performanceRow);
    }

    return summaryData;
};

const processDetailSheet = (
    detailSheet: { dataRows: any[][], headers: string[] },
    amData: ProcessedAmData,
    reportDate: Date
): FifoDetailCounts => {
    const counts: FifoDetailCounts = {
        saleoutAtSupermarket: 0,
        co: 0,
        fullExchange: 0,
        soReturn: 0,
        total: 0,
    };

    if (!detailSheet || !detailSheet.headers || !detailSheet.dataRows || !amData || !amData.nameToCode || !amData.codeToGO) {
        return counts;
    }

    const lowerCaseHeaders = detailSheet.headers.map(h => String(h || '').toLowerCase());
    const outputTypeIndex = lowerCaseHeaders.indexOf('output type');
    const saleDateIndex = lowerCaseHeaders.indexOf('sale date');
    const storeIndex = lowerCaseHeaders.indexOf('store');

    if (outputTypeIndex === -1 || saleDateIndex === -1 || storeIndex === -1) {
        return counts;
    }

    const saleoutKeywords = [
        'erablue- export change warranty installment goods at the store',
        'erablue- export warranty change at the store',
        'xuất bán hàng tại siêu thị',
        'xuất bán hàng online tại siêu thị',
        'xuất bán hàng trả góp tại siêu thị'
    ].map(k => k.normalize('NFC'));
    const coKeyword = 'xuất chuyển kho'.normalize('NFC');
    const fullExchangeKeyword = 'xuất đổi hàng'.normalize('NFC');
    const soReturnKeyword = 'xuất hàng ký gửi tạm'.normalize('NFC');

    for (const row of detailSheet.dataRows) {
        // A row is counted only if Sale Date has a value.
        const saleDateValue = row[saleDateIndex];
        if (!saleDateValue || saleDateValue === false) {
            continue;
        }
        const saleDateStr = String(saleDateValue).trim().toLowerCase();
        if (saleDateStr === '' || saleDateStr === 'false') {
            continue;
        }

        // Apply G.O. date filtering
        const storeName = String(row[storeIndex] || '').trim();
        let storeId = amData.nameToCode.get(storeName) || amData.nameToCode.get(storeName.toUpperCase());
        if (!storeId && amData.codeToAm.has(storeName)) storeId = storeName; // Fallback: treat name as code
        if (!storeId) continue;
        const goDate = amData.codeToGO.get(storeId);
        if (!goDate || goDate > reportDate) continue;

        const outputType = String(row[outputTypeIndex] || '')
            .normalize('NFC')
            .trim()
            .replace(/\s+/g, ' ') // Normalize multiple spaces into one
            .toLowerCase();

        if (saleoutKeywords.includes(outputType)) {
            counts.saleoutAtSupermarket++;
        } else if (outputType.includes(coKeyword)) {
            counts.co++;
        } else if (outputType.includes(fullExchangeKeyword)) {
            counts.fullExchange++;
        } else if (outputType.includes(soReturnKeyword)) {
            counts.soReturn++;
        }
    }

    counts.total = counts.saleoutAtSupermarket + counts.co + counts.fullExchange + counts.soReturn;
    return counts;
};


export const processFifoMistake = (
    sheets: { phone: any[][]; tablet: any[][]; tv: any[][]; speaker: any[][]; },
    amData: ProcessedAmData,
    detailSheets: {
        phone: { dataRows: any[][], headers: string[] };
        tablet: { dataRows: any[][], headers: string[] };
        tv: { dataRows: any[][], headers: string[] };
        speaker: { dataRows: any[][], headers: string[] };
    }
): FifoMistakeReportPayload => {
    if (!amData || !amData.codeToGO || amData.codeToGO.size === 0) {
        throw new Error("AM Data is missing Grand Opening ('G.O') column/dates, which are required for the FIFO report.");
    }

    const storeDataMap = new Map<string, { data: StoreMistakeData }>();
    let maxDay = 0;
    maxDay = Math.max(maxDay, parseCategorySheet(sheets.phone, 'phone', storeDataMap));
    maxDay = Math.max(maxDay, parseCategorySheet(sheets.tablet, 'tablet', storeDataMap));
    maxDay = Math.max(maxDay, parseCategorySheet(sheets.tv, 'tv', storeDataMap));
    maxDay = Math.max(maxDay, parseCategorySheet(sheets.speaker, 'speaker', storeDataMap));

    let reportDate: Date;
    const today = new Date();

    if (maxDay === 0) {
        // Fallback to original logic if no day headers are found in any file
        reportDate = new Date();
        reportDate.setDate(reportDate.getDate() - 1);
    } else {
        let reportYear = today.getFullYear();
        let reportMonth = today.getMonth(); // 0-indexed

        // If the max day from the file is greater than today's date,
        // it's likely for the previous month (e.g., it's Nov 3rd, but data goes to Oct 31st).
        if (maxDay > today.getDate()) {
            reportMonth -= 1;
            if (reportMonth < 0) {
                reportMonth = 11;
                reportYear -= 1;
            }
        }
        reportDate = new Date(reportYear, reportMonth, maxDay);
    }

    reportDate.setHours(0, 0, 0, 0);

    const currentDay = reportDate.getDate();
    const currentMonth = reportDate.getMonth();
    const currentYear = reportDate.getFullYear();
    const monthName = reportDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();

    const amStoreGroups: { [key: string]: FifoMistakeRow[] } = {};

    for (const [storeName, { data }] of storeDataMap.entries()) {
        let storeId = amData.nameToCode.get(storeName) || amData.nameToCode.get(storeName.toUpperCase());
        if (!storeId && amData.codeToAm.has(storeName)) storeId = storeName; // Fallback: treat name as code
        if (!storeId) continue;
        const goDate = amData.codeToGO.get(storeId);

        // DEBUG: Check why this specific store might be skipped
        if (storeName.includes("EBS_JBR_BKSKAB_CSE_JL. Raya Cikarang (Cibarusah)") || storeId.includes("EBS_JBR_BKSKAB_CSE_JL. Raya Cikarang (Cibarusah)")) {
            console.log(`[DEBUG LOOP 2] Store: ${storeName}, ID: ${storeId}`);
            console.log(`[DEBUG LOOP 2] GO Date: ${goDate}, Report Date: ${reportDate}`);
            console.log(`[DEBUG LOOP 2] Is Included? ${goDate && goDate <= reportDate}`);
        }

        if (!goDate || goDate > reportDate) continue;
        const am = amData.codeToAm.get(storeId) || 'Unknown AM';
        if (!amStoreGroups[am]) amStoreGroups[am] = [];

        let phoneSaleOut = 0, phoneMistake = 0, tabletSaleOut = 0, tabletMistake = 0, tvSaleOut = 0, tvMistake = 0, speakerSaleOut = 0, speakerMistake = 0;
        for (let day = 1; day <= currentDay; day++) {
            phoneSaleOut += data.phone[day]?.saleOut || 0; phoneMistake += data.phone[day]?.mistake || 0;
            tabletSaleOut += data.tablet[day]?.saleOut || 0; tabletMistake += data.tablet[day]?.mistake || 0;
            tvSaleOut += data.tv[day]?.saleOut || 0; tvMistake += data.tv[day]?.mistake || 0;
            speakerSaleOut += data.speaker[day]?.saleOut || 0; speakerMistake += data.speaker[day]?.mistake || 0;
        }

        amStoreGroups[am].push({
            isSummary: false, no: 0, storeId, storeName, am,
            phoneSaleOut, phoneMistake, phonePercent: phoneSaleOut > 0 ? phoneMistake / phoneSaleOut : 0,
            tabletSaleOut, tabletMistake, tabletPercent: tabletSaleOut > 0 ? tabletMistake / tabletSaleOut : 0,
            tvSaleOut, tvMistake, tvPercent: tvSaleOut > 0 ? tvMistake / tvSaleOut : 0,
            speakerSaleOut, speakerMistake, speakerPercent: speakerSaleOut > 0 ? speakerMistake / speakerSaleOut : 0,
        });
    }

    const finalReportData: FifoMistakeRow[] = [];
    const sortedAmNames = Object.keys(amStoreGroups).sort();
    let runningNo = 1;

    for (const am of sortedAmNames) {
        const stores = amStoreGroups[am].sort((a, b) => a.storeName.localeCompare(b.storeName));
        stores.forEach(store => { store.no = runningNo++; finalReportData.push(store); });

        const summaryRow: FifoMistakeRow = {
            isSummary: true, storeName: am,
            phoneSaleOut: stores.reduce((acc, s) => acc + s.phoneSaleOut, 0),
            phoneMistake: stores.reduce((acc, s) => acc + s.phoneMistake, 0),
            phonePercent: 0,
            tabletSaleOut: stores.reduce((acc, s) => acc + s.tabletSaleOut, 0),
            tabletMistake: stores.reduce((acc, s) => acc + s.tabletMistake, 0),
            tabletPercent: 0,
            tvSaleOut: stores.reduce((acc, s) => acc + s.tvSaleOut, 0),
            tvMistake: stores.reduce((acc, s) => acc + s.tvMistake, 0),
            tvPercent: 0,
            speakerSaleOut: stores.reduce((acc, s) => acc + s.speakerSaleOut, 0),
            speakerMistake: stores.reduce((acc, s) => acc + s.speakerMistake, 0),
            speakerPercent: 0,
        };
        summaryRow.phonePercent = summaryRow.phoneSaleOut > 0 ? summaryRow.phoneMistake / summaryRow.phoneSaleOut : 0;
        summaryRow.tabletPercent = summaryRow.tabletSaleOut > 0 ? summaryRow.tabletMistake / summaryRow.tabletSaleOut : 0;
        summaryRow.tvPercent = summaryRow.tvSaleOut > 0 ? summaryRow.tvMistake / summaryRow.tvSaleOut : 0;
        summaryRow.speakerPercent = summaryRow.speakerSaleOut > 0 ? summaryRow.speakerMistake / summaryRow.speakerSaleOut : 0;

        finalReportData.push(summaryRow);
    }

    // Generate Summaries
    const summaries: FifoWeeklySummary[] = [];
    const mtdSummaryData = calculateSummary(storeDataMap, amData, amData.codeToGO, 1, currentDay, reportDate, true);
    if (mtdSummaryData.length > 0) {
        summaries.push({
            title: `RESUME MTD FIFO ICT & AV | 01-${String(currentDay).padStart(2, '0')} ${monthName} ${currentYear}`,
            data: mtdSummaryData
        });
    }

    const weeks = getWeeksOfMonth(currentYear, currentMonth);
    weeks.forEach((week, index) => {
        if (week.start > currentDay) return;
        const weekEnd = Math.min(week.end, currentDay);
        const weeklySummaryData = calculateSummary(storeDataMap, amData, amData.codeToGO, week.start, weekEnd, reportDate, false);
        if (weeklySummaryData.length > 0) {
            summaries.push({
                title: `WEEK ${index + 1} (${String(week.start).padStart(2, '0')}-${String(weekEnd).padStart(2, '0')}) ${monthName} ${currentYear}`,
                data: weeklySummaryData
            });
        }
    });

    // Generate Underperformed Data
    const underperformedData: UnderperformedCategoryData = {
        phone: [], tablet: [], tv: [], speaker: [],
    };

    for (const [storeName, { data }] of storeDataMap.entries()) {
        let storeId = amData.nameToCode.get(storeName) || amData.nameToCode.get(storeName.toUpperCase());
        if (!storeId && amData.codeToAm.has(storeName)) storeId = storeName; // Fallback: treat name as code
        const storeFullName = amData.codeToName.get(storeId || '') || storeName;

        if (!storeId) continue;
        const goDate = amData.codeToGO.get(storeId);
        if (!goDate || goDate > reportDate) continue;

        let phoneSaleOut = 0, phoneMistake = 0, tabletSaleOut = 0, tabletMistake = 0, tvSaleOut = 0, tvMistake = 0, speakerSaleOut = 0, speakerMistake = 0;
        for (let day = 1; day <= currentDay; day++) {
            phoneSaleOut += data.phone[day]?.saleOut || 0; phoneMistake += data.phone[day]?.mistake || 0;
            tabletSaleOut += data.tablet[day]?.saleOut || 0; tabletMistake += data.tablet[day]?.mistake || 0;
            tvSaleOut += data.tv[day]?.saleOut || 0; tvMistake += data.tv[day]?.mistake || 0;
            speakerSaleOut += data.speaker[day]?.saleOut || 0; speakerMistake += data.speaker[day]?.mistake || 0;
        }

        const phonePercent = phoneSaleOut > 0 ? phoneMistake / phoneSaleOut : 0;
        if (phonePercent >= 0.03) {
            underperformedData.phone.push({ storeId, storeName: storeFullName, saleOut: phoneSaleOut, mistake: phoneMistake, percent: phonePercent });
        }

        const tabletPercent = tabletSaleOut > 0 ? tabletMistake / tabletSaleOut : 0;
        if (tabletPercent >= 0.03) {
            underperformedData.tablet.push({ storeId, storeName: storeFullName, saleOut: tabletSaleOut, mistake: tabletMistake, percent: tabletPercent });
        }

        const tvPercent = tvSaleOut > 0 ? tvMistake / tvSaleOut : 0;
        if (tvPercent >= 0.05) {
            underperformedData.tv.push({ storeId, storeName: storeFullName, saleOut: tvSaleOut, mistake: tvMistake, percent: tvPercent });
        }

        const speakerPercent = speakerSaleOut > 0 ? speakerMistake / speakerSaleOut : 0;
        if (speakerPercent >= 0.05) {
            underperformedData.speaker.push({ storeId, storeName: storeFullName, saleOut: speakerSaleOut, mistake: speakerMistake, percent: speakerPercent });
        }
    }

    underperformedData.phone.sort((a, b) => b.percent - a.percent);
    underperformedData.tablet.sort((a, b) => b.percent - a.percent);
    underperformedData.tv.sort((a, b) => b.percent - a.percent);
    underperformedData.speaker.sort((a, b) => b.percent - a.percent);

    // --- Construct Final Resume Data ---
    // Check if any detail data is present. If all detail sheets are empty, we skip generating resume data.
    const hasDetailData =
        (detailSheets.phone?.dataRows?.length > 0) ||
        (detailSheets.tablet?.dataRows?.length > 0) ||
        (detailSheets.tv?.dataRows?.length > 0) ||
        (detailSheets.speaker?.dataRows?.length > 0);

    if (!hasDetailData) {
        return { data: finalReportData, summaries, underperformedData, resumeData: null };
    }

    const mtdSummary = summaries.find(s => s.title.startsWith('RESUME MTD FIFO')) || null;
    const performanceRow = mtdSummary?.data.find(r => r.am === 'PERFORMANCE');

    // Get breakdown counts from detail sheets, now filtered by G.O. date.
    const phoneDetailCounts = processDetailSheet(detailSheets.phone, amData, reportDate);
    const tabletDetailCounts = processDetailSheet(detailSheets.tablet, amData, reportDate);
    const tvDetailCounts = processDetailSheet(detailSheets.tv, amData, reportDate);
    const speakerDetailCounts = processDetailSheet(detailSheets.speaker, amData, reportDate);

    // This object holds the detailed breakdown counts. The 'total' will be overridden next.
    const totalByCategory = {
        phone: phoneDetailCounts,
        tablet: tabletDetailCounts,
        tv: tvDetailCounts,
        speaker: speakerDetailCounts,
    };

    // This object holds the correct, filtered totals, consistent with the main report,
    // pulled from the already-calculated MTD summary performance row.
    const totalErablue = {
        phone: performanceRow?.phoneMistake ?? 0,
        tablet: performanceRow?.tabletMistake ?? 0,
        tv: performanceRow?.tvMistake ?? 0,
        speaker: performanceRow?.speakerMistake ?? 0,
        total: 0,
    };
    totalErablue.total = totalErablue.phone + totalErablue.tablet + totalErablue.tv + totalErablue.speaker;

    // Override the 'total' in each category's breakdown with the correct filtered total.
    // This ensures the totals displayed in the UI are consistent with the main report, even if the sum of details 
    // doesn't perfectly match due to data source discrepancies. This is the source of truth for totals.
    totalByCategory.phone.total = totalErablue.phone;
    totalByCategory.tablet.total = totalErablue.tablet;
    totalByCategory.tv.total = totalErablue.tv;
    totalByCategory.speaker.total = totalErablue.speaker;

    // Create the final summary object, using the filtered breakdown counts and the correct filtered grand total.
    const summary = {
        saleoutAtSupermarket: totalByCategory.phone.saleoutAtSupermarket + totalByCategory.tablet.saleoutAtSupermarket + totalByCategory.tv.saleoutAtSupermarket + totalByCategory.speaker.saleoutAtSupermarket,
        co: totalByCategory.phone.co + totalByCategory.tablet.co + totalByCategory.tv.co + totalByCategory.speaker.co,
        fullExchange: totalByCategory.phone.fullExchange + totalByCategory.tablet.fullExchange + totalByCategory.tv.fullExchange + totalByCategory.speaker.fullExchange,
        soReturn: totalByCategory.phone.soReturn + totalByCategory.tablet.soReturn + totalByCategory.tv.soReturn + totalByCategory.speaker.soReturn,
        total: totalErablue.total,
    };

    const resumeData: FifoResumeData = {
        mtdSummary,
        totalErablue,
        totalByCategory,
        summary,
    };

    return { data: finalReportData, summaries, underperformedData, resumeData };
};