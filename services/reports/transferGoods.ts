import { TransferGoodsData, AMSummaryData, TransferGoodsReportPayload, ProcessedAmData } from '../../types';
import { excelDateToJSDate, parseUnknownDateFormat } from '../utils';

export const processTransferGoods = (dataRows: any[][], headers: string[], amData: ProcessedAmData): TransferGoodsReportPayload => {
    if (!amData || !amData.codeToAm || !amData.codeToCity) {
        throw new Error("AM Data is missing or incomplete for Transfer Goods report.");
    }

    const headerIndices = {
        transportVoucher: headers.indexOf('Transport voucher'),
        outputStore: headers.indexOf('Ouput store'),
        inputStore: headers.indexOf('Input store'),
        transferStoreDate: headers.indexOf('Transfer store date'),
        inventoryStatus: headers.indexOf('Inventory status'),
    };

    if (Object.values(headerIndices).some(index => index === -1)) {
      throw new Error(`Missing required columns for Transfer Goods report. Ensure 'Transport voucher', 'Ouput store', 'Input store', 'Transfer store date', and 'Inventory status' are present.`);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);

    const today = new Date();

    const filteredData = dataRows.filter(row => {
        const dateValue = row[headerIndices.transferStoreDate];
        const transferDate = parseUnknownDateFormat(dateValue);
        return transferDate ? transferDate < sevenDaysAgo : false;
    });
    
    const mappedData: TransferGoodsData[] = filteredData.map(row => {
        const outputStore = String(row[headerIndices.outputStore] || '');
        const inputStore = String(row[headerIndices.inputStore] || '');
        const outputStoreCode = outputStore.split(' ')[0];
        const inputStoreCode = inputStore.split(' ')[0];

        const transferDateValue = row[headerIndices.transferStoreDate];
        const transferDate = parseUnknownDateFormat(transferDateValue);
        const dateFromTransfer = transferDate ? Math.floor((today.getTime() - transferDate.getTime()) / (1000 * 3600 * 24)) : 0;
        
        return {
            transportVoucher: String(row[headerIndices.transportVoucher] || ''),
            outputStore,
            outputCity: amData.codeToCity.get(outputStoreCode) || '',
            inputStore,
            inputCity: amData.codeToCity.get(inputStoreCode) || '',
            transferStoreDate: typeof transferDateValue === 'number' ? excelDateToJSDate(transferDateValue, 'date') : String(transferDateValue || '').split(' ')[0],
            inventoryStatus: String(row[headerIndices.inventoryStatus] || ''),
            dateFromTransfer: dateFromTransfer,
            amOutputStore: amData.codeToAm.get(outputStoreCode) || '',
            amInputStore: amData.codeToAm.get(inputStoreCode) || '',
        };
    });

    const sortedData = mappedData.sort((a, b) => b.dateFromTransfer - a.dateFromTransfer);

    const summaryMap = new Map<string, { outputStore: number; inputStore: number }>();
    sortedData.forEach(item => {
        const { amOutputStore, amInputStore } = item;
        
        if (amOutputStore) {
            if (!summaryMap.has(amOutputStore)) {
                summaryMap.set(amOutputStore, { outputStore: 0, inputStore: 0 });
            }
            summaryMap.get(amOutputStore)!.outputStore += 1;
        }

        if (amInputStore) {
            if (!summaryMap.has(amInputStore)) {
                summaryMap.set(amInputStore, { outputStore: 0, inputStore: 0 });
            }
            summaryMap.get(amInputStore)!.inputStore += 1;
        }
    });

    const summary: AMSummaryData[] = Array.from(summaryMap.entries()).map(([am, counts]) => ({
        am,
        outputStore: counts.outputStore,
        inputStore: counts.inputStore,
    }));


    return { data: sortedData, summary };
}