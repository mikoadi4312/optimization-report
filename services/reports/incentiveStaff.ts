import { IncentiveStaffRow, IncentiveCriterion } from '../../types';
import { parseUnknownDateFormat } from '../utils';

export const processIncentiveStaff = (
    dataRows: any[][],
    headers: string[],
    criteria: IncentiveCriterion[]
): IncentiveStaffRow[] => {
    if (!criteria || criteria.length === 0) {
        throw new Error("Incentive criteria are missing or empty.");
    }

    const headerIndices = {
        productCode: headers.findIndex(h => h.toLowerCase() === 'product code'),
        subCategoryBrand: headers.findIndex(h => h.toLowerCase() === 'sub category&brand'),
        createDate: headers.findIndex(h => h.toLowerCase() === 'create date'),
        createdUser: headers.findIndex(h => h.toLowerCase() === 'created user'),
        quantity: headers.findIndex(h => h.toLowerCase() === 'quantity'),
    };

    if (Object.values(headerIndices).some(index => index === -1)) {
        throw new Error("Main data file is missing one or more required columns: 'Product code', 'Sub Category&Brand', 'Create date', 'Created user', 'Quantity'.");
    }

    // Get unique product codes in the order they appear in the criteria file
    const productHeaders: string[] = [];
    const seenCodes = new Set<string>();
    criteria.forEach(c => {
        if (c.productCode && !seenCodes.has(c.productCode)) {
            productHeaders.push(c.productCode);
            seenCodes.add(c.productCode);
        }
    });

    const incentivesByStaff = new Map<string, { total: number; [productCode: string]: number }>();

    for (const row of dataRows) {
        const saleDate = parseUnknownDateFormat(row[headerIndices.createDate]);
        const productCode = String(row[headerIndices.productCode] || '').trim();
        const subCategoryBrand = String(row[headerIndices.subCategoryBrand] || '').trim();
        const createdUser = String(row[headerIndices.createdUser] || '').trim();
        const quantity = parseFloat(String(row[headerIndices.quantity] || '1').replace(/,/g, '.')) || 1;

        if (!saleDate || !createdUser || (!productCode && !subCategoryBrand)) {
            continue;
        }
        
        for (const criterion of criteria) {
            // Create a copy of the sale date and normalize it to UTC midnight for a correct date-only comparison.
            const saleDateOnly = new Date(saleDate.getTime());
            saleDateOnly.setUTCHours(0, 0, 0, 0);

            const isDateInRange = saleDateOnly >= criterion.startDate && saleDateOnly <= criterion.endDate;
            
            if (isDateInRange) {
                const isProductMatch = (productCode && productCode === criterion.productCode) || 
                                       (subCategoryBrand && subCategoryBrand === criterion.productCode);
                
                if (isProductMatch) {
                    if (!incentivesByStaff.has(createdUser)) {
                        const newEntry: { total: number; [productCode: string]: number } = { total: 0 };
                        productHeaders.forEach(p => newEntry[p] = 0);
                        incentivesByStaff.set(createdUser, newEntry);
                    }
                    const userIncentives = incentivesByStaff.get(createdUser)!;

                    const incentiveForRow = criterion.incentivePerUnit * quantity;

                    userIncentives.total += incentiveForRow;
                    // Safely increment incentive for the specific product
                    userIncentives[criterion.productCode] = (userIncentives[criterion.productCode] || 0) + incentiveForRow;
                    
                    break;
                }
            }
        }
    }

    // FIX: Use an intermediate object with an index signature to build the row progressively,
    // which resolves the "Property 'total' is missing" error. Cast to IncentiveStaffRow at the end.
    const result: IncentiveStaffRow[] = Array.from(incentivesByStaff.entries()).map(([staff, incentives]) => {
        // Build the row object with a specific key order: staff, products..., total
        const row: { [key: string]: string | number } = { staff };
        productHeaders.forEach(code => {
            row[code] = incentives[code] || 0;
        });
        row.total = incentives.total;
        return row as IncentiveStaffRow;
    });


    return result.sort((a, b) => a.staff.localeCompare(b.staff));
};