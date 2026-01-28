import { SaleOrder } from '../../types';
import { excelDateToJSDate, parseUnknownDateFormat } from '../utils';

const ALLOWED_SO_EXPORT_TYPES = [
  'ERABLUE- Sales at Store',
  'ERABLUE- Sales Delivery at home'
];

export const processSoNotExport = (dataRows: any[][], headers: string[]): SaleOrder[] => {
    const headerIndices = {
        orderCode: headers.indexOf('Order code'), customerName: headers.indexOf('Customer name'),
        createdDate: headers.indexOf('Created date'), outputStore: headers.indexOf('Ouput store'),
        totalAmount: headers.indexOf('Total amount payment'), exportType: headers.indexOf('Type of export request'),
        deliveryDate: headers.indexOf('Delivery date', headers.indexOf('Created date') + 1)
    };
    if (Object.values(headerIndices).some(index => index === -1)) {
        throw new Error(`Missing one or more required columns for SO Not Export report.`);
    }

    const uploadDate = new Date();
    uploadDate.setHours(0, 0, 0, 0); // Compare against the beginning of today

    const filteredData = dataRows.filter(row => {
        // Rule 1: Check export type
        const exportType = row[headerIndices.exportType];
        const isAllowedType = typeof exportType === 'string' && ALLOWED_SO_EXPORT_TYPES.includes(exportType.trim());
        if (!isAllowedType) {
            return false;
        }

        // Rule 2: Check if delivery date has passed
        const deliveryDateValue = row[headerIndices.deliveryDate];
        const deliveryDate = parseUnknownDateFormat(deliveryDateValue);

        if (!deliveryDate) {
            return false; // Exclude rows with invalid or missing delivery dates
        }

        deliveryDate.setHours(0, 0, 0, 0); // Compare against the beginning of the delivery day
        return deliveryDate < uploadDate;
    });

    const mappedData: SaleOrder[] = filteredData.map(row => ({
        orderCode: String(row[headerIndices.orderCode] || ''),
        customerName: String(row[headerIndices.customerName] || ''),
        createdDate: typeof row[headerIndices.createdDate] === 'number' ? excelDateToJSDate(row[headerIndices.createdDate]) : String(row[headerIndices.createdDate] || ''),
        deliveryDate: typeof row[headerIndices.deliveryDate] === 'number' ? excelDateToJSDate(row[headerIndices.deliveryDate]) : String(row[headerIndices.deliveryDate] || ''),
        outputStore: String(row[headerIndices.outputStore] || ''),
        totalAmount: parseFloat(String(row[headerIndices.totalAmount] || '0').replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0,
    }));
    
    return mappedData;
}