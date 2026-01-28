import { RevenueStaffRow, StaffInfo } from '../../types';
import { parseUnknownDateFormat } from '../utils';

const parseRevenue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const cleanedValue = value.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleanedValue);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

export const processRevenueStaff = (
    filesData: { dataRows: any[][], headers: string[] }[],
    staffInfoData: StaffInfo[]
): RevenueStaffRow[] => {
    if (filesData.length !== 6) {
        throw new Error("Please provide exactly 6 monthly revenue files.");
    }
    if (!staffInfoData || staffInfoData.length === 0) {
        throw new Error("Staff Info data is missing or empty.");
    }

    const COLUMNS = {
        INPUT_USER: 'Input User',
        REVENUE: 'Final Revenue included Return',
        DATE: 'Output Date'
    };

    const findHeaderIndex = (headers: string[], columnName: string): number => {
        const lowerCaseColumnName = columnName.toLowerCase();
        return headers.findIndex(h => h.trim().toLowerCase() === lowerCaseColumnName);
    };
    
    const monthlyData: { monthDate: Date; headers: string[]; dataRows: any[][]; }[] = [];

    for (const file of filesData) {
        const dateIndex = findHeaderIndex(file.headers, COLUMNS.DATE);
        if (dateIndex === -1) {
            throw new Error(`One of the files is missing the required '${COLUMNS.DATE}' column.`);
        }
        let fileMonthDate: Date | null = null;
        for (const row of file.dataRows) {
            const date = parseUnknownDateFormat(row[dateIndex]);
            if (date) {
                fileMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
                break;
            }
        }
        if (fileMonthDate) {
            monthlyData.push({ monthDate: fileMonthDate, ...file });
        } else {
            throw new Error("Could not determine the month for one of the files from its date column.");
        }
    }
    monthlyData.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime());
    const monthNames = monthlyData.map(md => md.monthDate.toLocaleString('en-US', { month: 'long' }));

    const revenueByUserByMonth = new Map<string, number[]>();
    staffInfoData.forEach(user => revenueByUserByMonth.set(user.inputUser, Array(6).fill(0)));

    monthlyData.forEach((monthFile, monthIndex) => {
        const userIndex = findHeaderIndex(monthFile.headers, COLUMNS.INPUT_USER);
        const revenueIndex = findHeaderIndex(monthFile.headers, COLUMNS.REVENUE);
        if (userIndex === -1 || revenueIndex === -1) return;
        monthFile.dataRows.forEach(row => {
            const user = String(row[userIndex] || '').trim();
            if (revenueByUserByMonth.has(user)) {
                revenueByUserByMonth.get(user)![monthIndex] += parseRevenue(row[revenueIndex]);
            }
        });
    });

    const rankings: { top: Set<string>, bottom: Set<string> }[] = [];
    for (let i = 0; i < 6; i++) {
        const monthRevenues = staffInfoData.map(staff => ({
            user: staff.inputUser,
            revenue: revenueByUserByMonth.get(staff.inputUser)![i]
        }));
        
        // Filter for staff with revenue > 0. This list will be the basis for all rankings.
        const activeStaff = monthRevenues.filter(s => s.revenue > 0);
        
        const topPerformers = new Set<string>();
        const bottomPerformers = new Set<string>();

        if (activeStaff.length > 0) {
            // Top performers: 10% of active staff
            const topCount = Math.ceil(activeStaff.length * 0.1);
            const sortedTop = [...activeStaff].sort((a, b) => b.revenue - a.revenue);
            const topThreshold = sortedTop[topCount - 1]?.revenue;
            if (topThreshold !== undefined) {
                sortedTop.filter(s => s.revenue >= topThreshold).forEach(s => topPerformers.add(s.user));
            }
            
            // Bottom performers: 10% of active staff
            const bottomCount = Math.ceil(activeStaff.length * 0.1);
            const sortedBottom = [...activeStaff].sort((a, b) => a.revenue - b.revenue);
            const bottomThreshold = sortedBottom[bottomCount - 1]?.revenue;
            if (bottomThreshold !== undefined) {
                // Do not mark staff as bottom if they are already in the top performers (handles cases with few staff or many ties)
                sortedBottom.filter(s => s.revenue <= bottomThreshold && !topPerformers.has(s.user)).forEach(s => bottomPerformers.add(s.user));
            }
        }
        
        rankings.push({ top: topPerformers, bottom: bottomPerformers });
    }

    const result: RevenueStaffRow[] = staffInfoData.map(staff => {
        const userRevenues = revenueByUserByMonth.get(staff.inputUser) || [0, 0, 0, 0, 0, 0];
        const row: RevenueStaffRow = {
            'NO': staff.no,
            'Input User': staff.inputUser,
            'Staff Name': staff.staffName,
            'Working Store': staff.workingStore,
        };
        monthlyData.forEach((_, i) => {
            const monthName = monthNames[i].toUpperCase().substring(0, 3);
            row[monthName] = userRevenues[i];
            row[`${monthName} STAR`] = rankings[i].top.has(staff.inputUser) ? '⭐' : '';
            row[`${monthName} BOTTOM`] = rankings[i].bottom.has(staff.inputUser) ? '😕' : '';
        });
        return row;
    });

    return result.sort((a, b) => a['NO'] - b['NO']);
};