import { IncentiveStaffRow, BolltechIncentiveCriterion } from '../../types';
import { parseUnknownDateFormat } from '../utils';

const parsePrice = (value: any): number => {
    if (value === null || value === undefined) return 0;
    // The replace logic handles both dots as thousand separators and comma as decimal separator
    const cleanedValue = String(value).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanedValue);
    return isNaN(num) ? 0 : num;
};

export const processIncentiveStaffBolltech = (
    dataRows: any[][],
    headers: string[],
    criteria: BolltechIncentiveCriterion[]
): IncentiveStaffRow[] => {
    if (!criteria || criteria.length === 0) {
        throw new Error("Bolltech incentive criteria are missing or empty.");
    }

    const lowerCaseHeaders = headers.map(h => h.toLowerCase());

    const headerIndices = {
        productCode: lowerCaseHeaders.indexOf('product code'),
        salePrice: lowerCaseHeaders.indexOf('sale price (vat)'),
        createDate: lowerCaseHeaders.indexOf('create date'),
        createdUser: lowerCaseHeaders.indexOf('created user'),
        quantity: lowerCaseHeaders.indexOf('quantity'),
    };

    if (Object.values(headerIndices).some(index => index === -1)) {
        throw new Error("Main data file is missing one or more required columns for Bolltech report: 'Product code', 'Sale Price (VAT)', 'Create date', 'Created user', 'Quantity'.");
    }

    const productHeaders = criteria.map(c => c.combinedKey);
    const uniqueProductHeaders = [...new Set(productHeaders)];

    const incentivesByStaff = new Map<string, { total: number; [productCode: string]: number }>();

    for (const row of dataRows) {
        const saleDate = parseUnknownDateFormat(row[headerIndices.createDate]);
        
        // FIX: Extract only the leading numeric part of the product code to match the criteria key format.
        const productCodeRaw = String(row[headerIndices.productCode] || '').trim();
        const numericPartMatch = productCodeRaw.match(/^\d+/);
        const productCode = numericPartMatch ? numericPartMatch[0] : productCodeRaw;

        const salePrice = parsePrice(row[headerIndices.salePrice]);
        const createdUser = String(row[headerIndices.createdUser] || '').trim();
        const quantity = parseFloat(String(row[headerIndices.quantity] || '1').replace(/,/g, '.')) || 1;

        if (!saleDate || !createdUser || !productCode || salePrice === 0) {
            continue;
        }

        const saleCombinedKey = `${productCode}${salePrice}`;
        
        for (const criterion of criteria) {
            // Create a copy of the sale date and normalize it to UTC midnight for a correct date-only comparison.
            const saleDateOnly = new Date(saleDate.getTime());
            saleDateOnly.setUTCHours(0, 0, 0, 0);
            
            const isDateInRange = saleDateOnly >= criterion.startDate && saleDateOnly <= criterion.endDate;
            
            if (isDateInRange && saleCombinedKey === criterion.combinedKey) {
                if (!incentivesByStaff.has(createdUser)) {
                    const newEntry: { total: number; [productCode: string]: number } = { total: 0 };
                    uniqueProductHeaders.forEach(p => newEntry[p] = 0);
                    incentivesByStaff.set(createdUser, newEntry);
                }
                const userIncentives = incentivesByStaff.get(createdUser)!;

                const incentiveForRow = criterion.incentivePerUnit * quantity;

                userIncentives.total += incentiveForRow;
                userIncentives[criterion.combinedKey] = (userIncentives[criterion.combinedKey] || 0) + incentiveForRow;
                
                break; 
            }
        }
    }

    const result: IncentiveStaffRow[] = Array.from(incentivesByStaff.entries()).map(([staff, incentives]) => {
        const row: { [key: string]: string | number } = { staff };
        uniqueProductHeaders.forEach(code => {
            row[code] = incentives[code] || 0;
        });
        row.total = incentives.total;
        return row as IncentiveStaffRow;
    });

    return result.sort((a, b) => a.staff.localeCompare(b.staff));
};