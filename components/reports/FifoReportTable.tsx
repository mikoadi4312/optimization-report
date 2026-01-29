import React, { useState } from 'react';
import { FifoMistakeRow, FifoWeeklySummary, FifoSummaryRow, UnderperformedCategoryData, UnderperformedStoreData, FifoResumeData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import FifoResumeTable from './FifoResumeTable';

// @ts-ignore
import XLSX from 'xlsx-js-style';

interface FifoReportTableProps {
    orders: FifoMistakeRow[];
    fifoSummaries?: FifoWeeklySummary[];
    fileName: string | null;
    underperformedData?: UnderperformedCategoryData | null;
    resumeData?: FifoResumeData | null;
    isLimitedView?: boolean;
    onClear?: () => void;
}

// A dedicated component for the summary tables to keep the code clean
const SummaryTable: React.FC<{ summary: FifoWeeklySummary }> = ({ summary }) => {
    const { t } = useLanguage();
    const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;
    const formatInteger = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const isPerformanceRow = (row: FifoSummaryRow) => row.am === 'PERFORMANCE';
    const hasTotalMistakeColumn = summary.data.length > 0 && summary.data[0].totalMistakePercent !== undefined;

    return (
        <div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full text-xs border-collapse">
                    <thead className="align-middle">
                        <tr>
                            <th rowSpan={2} className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300 bg-blue-800 text-white">{t('reports.tableHeaders.am')}</th>
                            <th colSpan={3} className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300 bg-yellow-400 text-red-600">PHONE</th>
                            <th colSpan={3} className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300 bg-yellow-400 text-red-600">TABLET</th>
                            <th colSpan={3} className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300 bg-yellow-400 text-red-600">TV</th>
                            <th colSpan={3} className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300 bg-yellow-400 text-red-600">SPEAKER</th>
                            {hasTotalMistakeColumn && <th rowSpan={2} className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300 bg-red-600 text-white">TOTAL MISTAKE</th>}
                        </tr>
                        <tr className="bg-slate-300 text-slate-800">
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                            <th className="px-2 py-2 text-center align-middle uppercase text-xs font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {summary.data.map((row, index) => (
                            <tr key={index} className={isPerformanceRow(row) ? 'bg-yellow-300 font-bold text-red-600' : 'hover:bg-blue-50'}>
                                <td className={`px-2 py-2 text-sm text-left border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-900'}`}>{row.am.toUpperCase()}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.phoneSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.phoneMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${row.phonePercent > 0.03 ? 'bg-yellow-300 text-red-600' : isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatPercent(row.phonePercent)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.tabletSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.tabletMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${row.tabletPercent > 0.05 ? 'bg-yellow-300 text-red-600' : isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatPercent(row.tabletPercent)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.tvSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.tvMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${row.tvPercent > 0.05 ? 'bg-yellow-300 text-red-600' : isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatPercent(row.tvPercent)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.speakerSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300 ${isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatInteger(row.speakerMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${row.speakerPercent > 0.05 ? 'bg-yellow-300 text-red-600' : isPerformanceRow(row) ? '' : 'text-slate-700'}`}>{formatPercent(row.speakerPercent)}</td>
                                {hasTotalMistakeColumn && <td className={`px-2 py-2 text-sm text-center font-bold border border-slate-300 text-red-600`}>{formatPercent(row.totalMistakePercent ?? 0)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const UnderperformedCategoryTable: React.FC<{ categoryName: string; data: UnderperformedStoreData[] }> = ({ categoryName, data }) => {
    const { t } = useLanguage();

    const formatInteger = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead className="text-xs font-bold uppercase">
                        <tr>
                            <th rowSpan={2} className="p-2 text-left text-white bg-[#2F5597] border border-slate-300 align-middle">{t('reports.tableHeaders.fifo.storeCode')}</th>
                            <th rowSpan={2} className="p-2 text-left text-white bg-[#2F5597] border border-slate-300 align-middle min-w-[300px]">{t('reports.tableHeaders.fifo.storeName')}</th>
                            <th colSpan={3} className="p-2 text-center text-red-600 bg-yellow-400 border border-slate-300">{categoryName}</th>
                        </tr>
                        <tr>
                            <th className="p-2 text-center text-black bg-gray-300 border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                            <th className="p-2 text-center text-black bg-gray-300 border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                            <th className="p-2 text-center text-black bg-gray-300 border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.storeId} className="border-t border-gray-200 hover:bg-blue-50">
                                <td className="p-2 whitespace-nowrap border border-slate-300 text-black">{item.storeId}</td>
                                <td className="p-2 border border-slate-300 text-black">{item.storeName}</td>
                                <td className="p-2 text-center border border-slate-300 text-black">{formatInteger(item.saleOut)}</td>
                                <td className="p-2 text-center border border-slate-300 text-black">{formatInteger(item.mistake)}</td>
                                <td className="p-2 text-center font-bold text-red-600 bg-yellow-200 border border-slate-300">{formatPercent(item.percent)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const FifoReportTable: React.FC<FifoReportTableProps> = ({ orders, fifoSummaries, underperformedData, resumeData, isLimitedView = false, onClear }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'main' | 'underperformed' | 'resume'>('main');

    const formatInteger = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

    const handleDownload = () => {
        const workbook = XLSX.utils.book_new();
        const thinBorder = { style: "thin", color: { rgb: "000000" } };
        const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
        const headerAlignment = { horizontal: "center", vertical: "center", wrapText: true };

        // Helper to ensure a cell exists in the worksheet before styling
        const ensureCell = (ws: any, r: number, c: number) => {
            const address = XLSX.utils.encode_cell({ r, c });
            if (!ws[address]) {
                ws[address] = { t: 's', v: '' }; // Create a blank string cell if it doesn't exist
            }
            return ws[address];
        };

        // Helper to apply a style to every cell in a given range
        const applyStyleToRange = (ws: any, range: { s: { r: number, c: number }, e: { r: number, c: number } }, style: any) => {
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell = ensureCell(ws, R, C);
                    cell.s = style;
                }
            }
        };


        let reportDate: Date;
        if (fifoSummaries && fifoSummaries.length > 0) {
            const title = fifoSummaries[0].title;
            const dateMatch = title.match(/(\d{2})\s([A-Z]+)\s(\d{4})/);
            if (dateMatch) {
                reportDate = new Date(`${dateMatch[2]} ${dateMatch[1]}, ${dateMatch[3]}`);
            } else {
                reportDate = new Date(); // Fallback
            }
        } else {
            reportDate = new Date();
        }

        const day = reportDate.getDate();
        const monthName = reportDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
        const year = reportDate.getFullYear();
        const formattedDate = `01 - ${String(day).padStart(2, '0')} ${monthName} ${year}`;
        const title = t('reports.fifo.excelTitle', { date: formattedDate }).toUpperCase();

        const fifoData = orders as FifoMistakeRow[];
        const aoa: (string | number | null)[][] = [
            [title, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [t('reports.tableHeaders.fifo.no').toUpperCase(), t('reports.tableHeaders.fifo.storeCode').toUpperCase(), t('reports.tableHeaders.fifo.storeName').toUpperCase(), t('reports.tableHeaders.am').toUpperCase(), "PHONE", null, null, "TABLET", null, null, "TV", null, null, "SPEAKER", null, null],
            [null, null, null, null, t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase()],
        ];

        const merges = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
            { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } }, { s: { r: 1, c: 7 }, e: { r: 1, c: 9 } },
            { s: { r: 1, c: 10 }, e: { r: 1, c: 12 } }, { s: { r: 1, c: 13 }, e: { r: 1, c: 15 } },
            { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } }, { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } },
            { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } },
        ];

        fifoData.forEach((row) => {
            const rowIndex = aoa.length;
            if (row.isSummary) {
                aoa.push([
                    row.storeName.toUpperCase(), null, null, null,
                    row.phoneSaleOut, row.phoneMistake, row.phonePercent,
                    row.tabletSaleOut, row.tabletMistake, row.tabletPercent,
                    row.tvSaleOut, row.tvMistake, row.tvPercent,
                    row.speakerSaleOut, row.speakerMistake, row.speakerPercent,
                ]);
                merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 3 } });
            } else {
                aoa.push([
                    row.no ?? '', row.storeId ?? '', row.storeName ?? '', row.am ?? '',
                    row.phoneSaleOut, row.phoneMistake, row.phonePercent,
                    row.tabletSaleOut, row.tabletMistake, row.tabletPercent,
                    row.tvSaleOut, row.tvMistake, row.tvPercent,
                    row.speakerSaleOut, row.speakerMistake, row.speakerPercent,
                ]);
            }
        });

        // Replace all null/undefined with empty strings to ensure cells are created
        const cleanAoa = aoa.map(row => row.map(cell => cell ?? ''));
        const worksheet = XLSX.utils.aoa_to_sheet(cleanAoa);

        const whiteFont = { color: { rgb: "FFFFFF" } };
        const blackFont = { color: { rgb: "000000" } };
        const redFont = { color: { rgb: "FF0000" } };
        const darkBlueFill = { fgColor: { rgb: "2F5597" } };
        const yellowFill = { fgColor: { rgb: "FFFF00" } };
        const lightYellowFill = { fgColor: { rgb: "FFC000" } }; // For AM summary row in main table
        const centeredAlignment = { horizontal: "center", vertical: "center", wrapText: true };

        const titleStyle = { font: { bold: true, sz: 14, ...whiteFont }, alignment: { horizontal: "center", vertical: "center" }, fill: darkBlueFill, border: border };
        const mainHeaderStyle = { font: { bold: true, ...whiteFont }, fill: darkBlueFill, border: border, alignment: centeredAlignment };
        const categoryHeaderStyle = { font: { bold: true, ...redFont }, fill: yellowFill, border: border, alignment: centeredAlignment };
        const subHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "D9D9D9" } }, border: border, alignment: centeredAlignment };
        const amSummaryStyle = { font: { bold: true, ...blackFont }, fill: lightYellowFill, border: border, alignment: { horizontal: "center", vertical: "center" } };
        const regularCellStyle = { border: border, alignment: { horizontal: "center", vertical: "center" } };
        const regularTextCellStyle = { border: border, alignment: { horizontal: "left", vertical: "center" } };
        const alertStyle = { fill: yellowFill, font: redFont };

        // Style headers
        applyStyleToRange(worksheet, { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } }, titleStyle);
        merges.forEach(merge => {
            if (merge.s.r === 1) { // Main Headers
                const style = merge.s.c < 4 ? mainHeaderStyle : categoryHeaderStyle;
                applyStyleToRange(worksheet, merge, style);
            }
        });
        for (let c = 4; c < 16; c++) {
            ensureCell(worksheet, 2, c).s = subHeaderStyle;
        }

        // Style data rows
        fifoData.forEach((row, index) => {
            const rowIndex = index + 3;
            if (row.isSummary) {
                applyStyleToRange(worksheet, { s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 3 } }, { ...amSummaryStyle, alignment: { horizontal: 'center', vertical: 'center' } });
            }
            for (let c = 0; c < 16; c++) {
                const cell = ensureCell(worksheet, rowIndex, c);
                const isPercentCol = [6, 9, 12, 15].includes(c);
                const isIntegerCol = c === 0 || [4, 5, 7, 8, 10, 11, 13, 14].includes(c);
                let finalStyle;

                if (row.isSummary) {
                    finalStyle = { ...amSummaryStyle };
                    if (c === 0 && row.storeName) cell.v = row.storeName.toUpperCase();
                } else {
                    finalStyle = (c >= 1 && c <= 3) ? { ...regularTextCellStyle, font: { ...blackFont } } : { ...regularCellStyle, font: { ...blackFont } };
                }

                if (isPercentCol) {
                    let applyAlert = (c === 6 && row.phonePercent > 0.03) || (c === 9 && row.tabletPercent > 0.05) || (c === 12 && row.tvPercent > 0.05) || (c === 15 && row.speakerPercent > 0.05);
                    if (applyAlert) finalStyle = { ...finalStyle, fill: alertStyle.fill, font: { ...(finalStyle.font || {}), ...alertStyle.font, bold: true } };
                }

                if (isIntegerCol) finalStyle.numFmt = "#,##0";
                else if (isPercentCol) finalStyle.numFmt = "0%";

                // Don't overwrite style for merged summary name
                if (row.isSummary && c > 0) {
                    cell.s = finalStyle;
                } else if (!row.isSummary) {
                    cell.s = finalStyle;
                }
            }
        });

        const mainTableColWidths = [{ wch: 5 }, { wch: 10 }, { wch: 45 }, { wch: 20 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];

        if (fifoSummaries && fifoSummaries.length > 0) {
            let summaryStartCol = 18;
            let summaryStartRow = 0;
            const summaryTitleStyle = { font: { bold: true, sz: 12, ...whiteFont }, fill: darkBlueFill, border: border, alignment: { horizontal: "center", vertical: "center" } };
            const summaryHeaderStyle = { font: { bold: true, ...whiteFont }, fill: darkBlueFill, border: border, alignment: centeredAlignment };
            const totalMistakeHeaderStyle = { font: { bold: true, ...whiteFont }, fill: { fgColor: { rgb: "FF0000" } }, border: border, alignment: centeredAlignment };
            const summarySubHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "D9D9D9" } }, border: border, alignment: centeredAlignment };
            const summaryDataStyle = { border: border, alignment: { horizontal: "center", vertical: "center" }, numFmt: "" };
            const summaryDataNameStyle = { ...summaryDataStyle, alignment: { ...summaryDataStyle.alignment, horizontal: "left", indent: 1 } };
            const performanceFill = { fgColor: { rgb: "FFFF00" } }; // Yellow background for performance row
            const performanceStyle = { ...summaryDataStyle, fill: performanceFill, font: { bold: true, ...redFont } };
            const performanceNameStyle = { ...performanceStyle, alignment: { ...performanceStyle.alignment, horizontal: "left", indent: 1 } };

            fifoSummaries.forEach(summary => {
                const hasTotalMistakeColumn = summary.data.length > 0 && summary.data[0].totalMistakePercent !== undefined;
                const numDataCols = hasTotalMistakeColumn ? 14 : 13;

                const summaryAoa: (string | number | null)[][] = [];

                const header1 = [t('reports.tableHeaders.am').toUpperCase(), 'PHONE', null, null, 'TABLET', null, null, 'TV', null, null, 'SPEAKER', null, null];
                if (hasTotalMistakeColumn) header1.push('TOTAL MISTAKE');

                const header2 = [null, t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase()];
                if (hasTotalMistakeColumn) header2.push(null);

                summaryAoa.push([summary.title.toUpperCase(), ...Array(numDataCols - 1).fill(null)]);
                summaryAoa.push(header1);
                summaryAoa.push(header2);

                summary.data.forEach(amRow => {
                    const rowData: (string | number | undefined)[] = [amRow.am.toUpperCase(), amRow.phoneSaleOut, amRow.phoneMistake, amRow.phonePercent, amRow.tabletSaleOut, amRow.tabletMistake, amRow.tabletPercent, amRow.tvSaleOut, amRow.tvMistake, amRow.tvPercent, amRow.speakerSaleOut, amRow.speakerMistake, amRow.speakerPercent];
                    if (hasTotalMistakeColumn) {
                        rowData.push(amRow.totalMistakePercent);
                    }
                    summaryAoa.push(rowData);
                });

                XLSX.utils.sheet_add_aoa(worksheet, summaryAoa.map(r => r.map(c => c ?? '')), { origin: { r: summaryStartRow, c: summaryStartCol } });

                const summaryMerges = [
                    { s: { r: summaryStartRow, c: summaryStartCol }, e: { r: summaryStartRow, c: summaryStartCol + numDataCols - 1 } },
                    { s: { r: summaryStartRow + 1, c: summaryStartCol }, e: { r: summaryStartRow + 2, c: summaryStartCol } },
                    { s: { r: summaryStartRow + 1, c: summaryStartCol + 1 }, e: { r: summaryStartRow + 1, c: summaryStartCol + 3 } },
                    { s: { r: summaryStartRow + 1, c: summaryStartCol + 4 }, e: { r: summaryStartRow + 1, c: summaryStartCol + 6 } },
                    { s: { r: summaryStartRow + 1, c: summaryStartCol + 7 }, e: { r: summaryStartRow + 1, c: summaryStartCol + 9 } },
                    { s: { r: summaryStartRow + 1, c: summaryStartCol + 10 }, e: { r: summaryStartRow + 1, c: summaryStartCol + 12 } },
                ];
                if (hasTotalMistakeColumn) {
                    summaryMerges.push({ s: { r: summaryStartRow + 1, c: summaryStartCol + 13 }, e: { r: summaryStartRow + 2, c: summaryStartCol + 13 } });
                }
                merges.push(...summaryMerges);

                // Apply styles to summary tables
                applyStyleToRange(worksheet, summaryMerges[0], summaryTitleStyle);
                applyStyleToRange(worksheet, summaryMerges[1], summaryHeaderStyle);
                if (hasTotalMistakeColumn) { applyStyleToRange(worksheet, summaryMerges[6], totalMistakeHeaderStyle); }
                for (let i = 2; i <= 5; i++) {
                    applyStyleToRange(worksheet, summaryMerges[i], { ...categoryHeaderStyle, font: { ...categoryHeaderStyle.font, sz: 11 } });
                }

                for (let r = summaryStartRow + 2; r < summaryStartRow + summaryAoa.length; r++) {
                    for (let c = summaryStartCol; c < summaryStartCol + numDataCols; c++) {
                        if (r === summaryStartRow + 2 && c > summaryStartCol) {
                            if (!hasTotalMistakeColumn || c < summaryStartCol + 13)
                                ensureCell(worksheet, r, c).s = summarySubHeaderStyle;
                        } else if (r > summaryStartRow + 2) {
                            const amRow = summary.data[r - (summaryStartRow + 3)];
                            if (!amRow) continue;
                            const isPerfRow = amRow.am === 'PERFORMANCE';
                            const isNameCol = c === summaryStartCol;
                            const isTotalMistakeCol = hasTotalMistakeColumn && c === summaryStartCol + 13;
                            let currentStyle: any = isPerfRow ? (isNameCol ? performanceNameStyle : performanceStyle) : (isNameCol ? summaryDataNameStyle : summaryDataStyle);

                            if (isTotalMistakeCol) {
                                currentStyle = { ...currentStyle, font: { ...(currentStyle.font || {}), ...redFont, bold: true }, numFmt: "0%" };
                            } else {
                                const percentColIndex = c - summaryStartCol;
                                let applyAlert = (percentColIndex === 3 && amRow.phonePercent > 0.03) || (percentColIndex === 6 && amRow.tabletPercent > 0.05) || (percentColIndex === 9 && amRow.tvPercent > 0.05) || (percentColIndex === 12 && amRow.speakerPercent > 0.05);
                                if (applyAlert && !isPerfRow) currentStyle = { ...currentStyle, fill: alertStyle.fill, font: { ...(currentStyle.font || {}), ...alertStyle.font, bold: true } };
                                if ([3, 6, 9, 12].includes(percentColIndex)) currentStyle = { ...currentStyle, numFmt: "0%" };
                                else if (!isNameCol) currentStyle = { ...currentStyle, numFmt: "#,##0" };
                            }
                            ensureCell(worksheet, r, c).s = currentStyle;
                        }
                    }
                }
                summaryStartRow += summaryAoa.length + 2;
            });

            const mtdHasTotalMistake = fifoSummaries[0]?.data?.[0]?.totalMistakePercent !== undefined;
            const summaryColWidths = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
            if (mtdHasTotalMistake) {
                summaryColWidths.push({ wch: 12 });
            }

            worksheet['!cols'] = [...mainTableColWidths, { wch: 2 }, { wch: 2 }, ...summaryColWidths];
        } else {
            worksheet['!cols'] = mainTableColWidths;
        }

        worksheet['!merges'] = merges;
        XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.fifo.title'));

        // Create and add UNDERPERFORMED sheet
        if (underperformedData && (underperformedData.phone.length > 0 || underperformedData.tablet.length > 0 || underperformedData.tv.length > 0 || underperformedData.speaker.length > 0)) {
            const underWs = XLSX.utils.aoa_to_sheet([]);
            const underMerges: any[] = [];

            const createCategoryTableAoa = (categoryName: string, data: UnderperformedStoreData[]): (string | number | null)[][] => {
                const aoa: (string | number | null)[][] = [];
                aoa.push([
                    categoryName.toUpperCase(), null, null
                ]);
                aoa.push([
                    t('reports.tableHeaders.fifo.saleOut').toUpperCase(),
                    t('reports.tableHeaders.fifo.mistake').toUpperCase(),
                    t('reports.tableHeaders.fifo.percent').toUpperCase(),
                ]);
                data.forEach(item => {
                    aoa.push([
                        item.saleOut,
                        item.mistake,
                        item.percent,
                    ]);
                });
                // Prepend store data
                aoa.forEach((row, index) => {
                    if (index < 2) {
                        row.unshift(t('reports.tableHeaders.fifo.storeName').toUpperCase());
                        row.unshift(t('reports.tableHeaders.fifo.storeCode').toUpperCase());
                    } else {
                        row.unshift(data[index - 2].storeName);
                        row.unshift(data[index - 2].storeId);
                    }
                });

                return aoa.map(r => r.map(c => c ?? ''));
            };

            const applyTableStyles = (ws: any, startRow: number, startCol: number, numDataRows: number) => {
                const categoryTitleStyle = { font: { bold: true, sz: 12, color: { rgb: "FF0000" } }, fill: { fgColor: { rgb: "FFFF00" } }, border: border, alignment: centeredAlignment };
                const storeHeaderStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2F5597" } }, border: border, alignment: centeredAlignment };
                const dataSubHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "D9D9D9" } }, border: border, alignment: centeredAlignment };
                const percentStyle = { ...regularCellStyle, font: { bold: true, color: { rgb: "FF0000" } }, numFmt: "0%", fill: { fgColor: { rgb: "FFFF00" } } };
                const textDataCellStyle = { ...regularTextCellStyle };
                const numberDataCellStyle = { ...regularCellStyle, numFmt: "#,##0" };

                const merge1 = { s: { r: startRow, c: startCol }, e: { r: startRow + 1, c: startCol } }; // Merge Store ID
                const merge2 = { s: { r: startRow, c: startCol + 1 }, e: { r: startRow + 1, c: startCol + 1 } }; // Merge Store Name
                const merge3 = { s: { r: startRow, c: startCol + 2 }, e: { r: startRow, c: startCol + 4 } }; // Merge Category Name
                underMerges.push(merge1, merge2, merge3);

                applyStyleToRange(ws, merge1, storeHeaderStyle);
                applyStyleToRange(ws, merge2, storeHeaderStyle);
                applyStyleToRange(ws, merge3, categoryTitleStyle);

                for (let c = startCol + 2; c <= startCol + 4; c++) {
                    ensureCell(ws, startRow + 1, c).s = dataSubHeaderStyle;
                }

                for (let r = startRow + 2; r < startRow + 2 + numDataRows; r++) {
                    ensureCell(ws, r, startCol).s = textDataCellStyle;
                    ensureCell(ws, r, startCol + 1).s = textDataCellStyle;
                    ensureCell(ws, r, startCol + 2).s = numberDataCellStyle;
                    ensureCell(ws, r, startCol + 3).s = numberDataCellStyle;
                    ensureCell(ws, r, startCol + 4).s = percentStyle;
                }
            };

            const phoneAoa = createCategoryTableAoa('PHONE', underperformedData.phone);
            const tvAoa = createCategoryTableAoa('TV', underperformedData.tv);
            const speakerAoa = createCategoryTableAoa('SPEAKER', underperformedData.speaker);
            const tabletAoa = createCategoryTableAoa('TABLET', underperformedData.tablet);

            XLSX.utils.sheet_add_aoa(underWs, phoneAoa, { origin: 'A1' });
            applyTableStyles(underWs, 0, 0, underperformedData.phone.length);

            XLSX.utils.sheet_add_aoa(underWs, tvAoa, { origin: 'G1' });
            applyTableStyles(underWs, 0, 6, underperformedData.tv.length);

            XLSX.utils.sheet_add_aoa(underWs, speakerAoa, { origin: 'M1' });
            applyTableStyles(underWs, 0, 12, underperformedData.speaker.length);

            const maxTopRows = Math.max(underperformedData.phone.length, underperformedData.tv.length, underperformedData.speaker.length);
            const tabletStartY = 1 + 1 + maxTopRows + 1;

            XLSX.utils.sheet_add_aoa(underWs, tabletAoa, { origin: { r: tabletStartY, c: 0 } });
            applyTableStyles(underWs, tabletStartY, 0, underperformedData.tablet.length);

            const tableColWidths = [{ wch: 15 }, { wch: 45 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
            const emptyColWidth = { wch: 2 };
            underWs['!cols'] = [
                ...tableColWidths,
                emptyColWidth,
                ...tableColWidths,
                emptyColWidth,
                ...tableColWidths
            ];

            underWs['!merges'] = underMerges;
            XLSX.utils.book_append_sheet(workbook, underWs, "UNDERPERFORMED");
        }

        if (resumeData) {
            const resumeWs = XLSX.utils.aoa_to_sheet([]);
            const resumeMerges: any[] = [];
            let currentRow = 0;

            // 1. MTD Summary Table
            if (resumeData.mtdSummary) {
                const summary = resumeData.mtdSummary;
                const hasTotalMistakeColumn = summary.data.length > 0 && summary.data[0].totalMistakePercent !== undefined;
                const numDataCols = hasTotalMistakeColumn ? 14 : 13;

                const summaryTitleStyle = { font: { bold: true, sz: 12, ...whiteFont }, fill: darkBlueFill, border: border, alignment: centeredAlignment };
                const summaryHeaderStyle = { font: { bold: true, ...whiteFont }, fill: darkBlueFill, border: border, alignment: centeredAlignment };
                const totalMistakeHeaderStyle = { font: { bold: true, ...whiteFont }, fill: { fgColor: { rgb: "FF0000" } }, border: border, alignment: centeredAlignment };
                const summarySubHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "D9D9D9" } }, border: border, alignment: centeredAlignment };
                const summaryDataStyle = { border: border, alignment: { horizontal: "center", vertical: "center" }, font: blackFont };
                const summaryDataNameStyle = { ...summaryDataStyle, alignment: { ...summaryDataStyle.alignment, horizontal: "left", indent: 1 } };
                const performanceFill = { fgColor: { rgb: "FFFF00" } };
                const performanceStyle = { ...summaryDataStyle, fill: performanceFill, font: { bold: true, ...redFont } };
                const performanceNameStyle = { ...performanceStyle, alignment: { ...performanceStyle.alignment, horizontal: "left", indent: 1 } };

                const summaryAoa = [
                    [summary.title.toUpperCase(), ...Array(numDataCols - 1).fill(null)],
                    [t('reports.tableHeaders.am').toUpperCase(), 'PHONE', null, null, 'TABLET', null, null, 'TV', null, null, 'SPEAKER', null, null, hasTotalMistakeColumn ? 'TOTAL MISTAKE' : null],
                    [null, t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), t('reports.tableHeaders.fifo.saleOut').toUpperCase(), t('reports.tableHeaders.fifo.mistake').toUpperCase(), t('reports.tableHeaders.fifo.percent').toUpperCase(), hasTotalMistakeColumn ? null : null]
                ];

                summary.data.forEach(amRow => {
                    const rowData: (string | number | undefined)[] = [amRow.am.toUpperCase(), amRow.phoneSaleOut, amRow.phoneMistake, amRow.phonePercent, amRow.tabletSaleOut, amRow.tabletMistake, amRow.tabletPercent, amRow.tvSaleOut, amRow.tvMistake, amRow.tvPercent, amRow.speakerSaleOut, amRow.speakerMistake, amRow.speakerPercent];
                    if (hasTotalMistakeColumn) rowData.push(amRow.totalMistakePercent);
                    summaryAoa.push(rowData);
                });

                XLSX.utils.sheet_add_aoa(resumeWs, summaryAoa.map(r => r.map(c => c ?? '')), { origin: { r: currentRow, c: 0 } });

                const mtdMerges = [
                    { s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numDataCols - 1 } },
                    { s: { r: currentRow + 1, c: 0 }, e: { r: currentRow + 2, c: 0 } },
                    { s: { r: currentRow + 1, c: 1 }, e: { r: currentRow + 1, c: 3 } },
                    { s: { r: currentRow + 1, c: 4 }, e: { r: currentRow + 1, c: 6 } },
                    { s: { r: currentRow + 1, c: 7 }, e: { r: currentRow + 1, c: 9 } },
                    { s: { r: currentRow + 1, c: 10 }, e: { r: currentRow + 1, c: 12 } }
                ];
                if (hasTotalMistakeColumn) mtdMerges.push({ s: { r: currentRow + 1, c: 13 }, e: { r: currentRow + 2, c: 13 } });
                resumeMerges.push(...mtdMerges);

                applyStyleToRange(resumeWs, mtdMerges[0], summaryTitleStyle);
                applyStyleToRange(resumeWs, mtdMerges[1], summaryHeaderStyle);
                for (let i = 2; i < mtdMerges.length; i++) {
                    if (hasTotalMistakeColumn && i === mtdMerges.length - 1) {
                        applyStyleToRange(resumeWs, mtdMerges[i], totalMistakeHeaderStyle);
                    } else {
                        applyStyleToRange(resumeWs, mtdMerges[i], { ...categoryHeaderStyle, font: { ...categoryHeaderStyle.font, sz: 11 } });
                    }
                }

                for (let r = currentRow + 2; r < currentRow + summaryAoa.length; r++) {
                    for (let c = 0; c < numDataCols; c++) {
                        const isDataRow = r > currentRow + 2;
                        if (r === currentRow + 2 && c > 0) {
                            if (!hasTotalMistakeColumn || c < 13) ensureCell(resumeWs, r, c).s = summarySubHeaderStyle;
                        } else if (isDataRow) {
                            const amRow = summary.data[r - (currentRow + 3)];
                            const isPerfRow = amRow.am === 'PERFORMANCE';
                            const isNameCol = c === 0;
                            const isTotalMistakeCol = hasTotalMistakeColumn && c === 13;
                            let currentStyle: any = isPerfRow ? (isNameCol ? performanceNameStyle : performanceStyle) : (isNameCol ? summaryDataNameStyle : summaryDataStyle);

                            if (isTotalMistakeCol) {
                                currentStyle = { ...currentStyle, font: { ...(currentStyle.font || {}), ...redFont, bold: true }, numFmt: "0%" };
                            } else {
                                const percentColIndex = c;
                                let applyAlert = (percentColIndex === 3 && amRow.phonePercent > 0.03) || (percentColIndex === 6 && amRow.tabletPercent > 0.05) || (percentColIndex === 9 && amRow.tvPercent > 0.05) || (percentColIndex === 12 && amRow.speakerPercent > 0.05);
                                if (applyAlert && !isPerfRow) currentStyle = { ...currentStyle, fill: alertStyle.fill, font: { ...(currentStyle.font || {}), ...alertStyle.font, bold: true, color: redFont.color } };
                                if ([3, 6, 9, 12].includes(percentColIndex)) currentStyle = { ...currentStyle, numFmt: "0%" };
                                else if (!isNameCol) currentStyle = { ...currentStyle, numFmt: "#,##0" };
                            }
                            ensureCell(resumeWs, r, c).s = currentStyle;
                        }
                    }
                }
                currentRow += summaryAoa.length + 2;
            }

            const createResumeCard = (ws: any, merges: any[], startR: number, startC: number, title: string, totalLabel: string, totalValue: number, data: { label: string, value: number }[], type: 'total' | 'summary' | 'category', isLimitedView: boolean) => {
                // Sort data by value descending
                const sortedData = [...data].sort((a, b) => b.value - a.value);

                const cardAoa = [];

                if (!isLimitedView) {
                    cardAoa.push([title.toUpperCase(), null, null]);
                }

                cardAoa.push([totalLabel, totalValue, '%']);

                sortedData.forEach(row => {
                    cardAoa.push([
                        row.label,
                        row.value,
                        totalValue > 0 ? row.value / totalValue : 0
                    ]);
                });

                const finalCardAoa = cardAoa.map(r => r.map(c => c ?? ''));
                XLSX.utils.sheet_add_aoa(ws, finalCardAoa, { origin: { r: startR, c: startC } });

                // Styles
                const cardTitleStyle = { font: { bold: true }, fill: yellowFill, border: border, alignment: centeredAlignment };
                const cardHeaderStyle = { ...cardTitleStyle, font: { ...cardTitleStyle.font, color: redFont.color } };
                const cardHeaderLabelStyle = { ...cardTitleStyle, font: blackFont };
                const percentHeaderStyle = { ...cardTitleStyle, font: blackFont };
                const dataLabelStyle = { border: border, alignment: { vertical: 'center' }, font: blackFont };
                const dataValueStyle = { border: border, alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0', font: blackFont };
                const dataPercentStyle = { ...dataValueStyle, numFmt: '0%', font: { ...blackFont, bold: true } };
                const greyFill = { fgColor: { rgb: "F2F2F2" } };

                if (!isLimitedView) {
                    const titleMerge = { s: { r: startR, c: startC }, e: { r: startR, c: startC + 2 } };
                    merges.push(titleMerge);
                    applyStyleToRange(ws, titleMerge, cardTitleStyle);
                }

                const headerRowOffset = isLimitedView ? 0 : 1;

                for (let r = startR + headerRowOffset; r < startR + finalCardAoa.length; r++) {
                    for (let c = startC; c < startC + 3; c++) {
                        const cell = ensureCell(ws, r, c);
                        if (r === startR + headerRowOffset) {
                            if (c === startC) cell.s = cardHeaderLabelStyle;
                            else if (c === startC + 1) cell.s = cardHeaderStyle;
                            else cell.s = percentHeaderStyle;
                        } else {
                            if (c === startC) cell.s = { ...dataLabelStyle };
                            else if (c === startC + 1) cell.s = { ...dataValueStyle };
                            else if (c === startC + 2) cell.s = { ...dataPercentStyle };

                            const dataRowIndex = r - (startR + headerRowOffset + 1);
                            const isTotalTable = type === 'total' && (dataRowIndex === 0 || dataRowIndex === 2);
                            const isSummaryTable = type === 'summary' && (dataRowIndex === 2);
                            if (isTotalTable || isSummaryTable) {
                                cell.s.fill = greyFill;
                            }
                        }
                    }
                }
                return finalCardAoa.length;
            };

            const { totalErablue, totalByCategory, summary } = resumeData;
            const totalErablueData = [{ label: 'Phone', value: totalErablue.phone }, { label: 'Tablet', value: totalErablue.tablet }, { label: 'TV', value: totalErablue.tv }, { label: 'Speaker', value: totalErablue.speaker }];
            const summaryData = [{ label: 'Saleout at supermarket', value: summary.saleoutAtSupermarket }, { label: 'CO', value: summary.co }, { label: 'FULL EXCHANGE', value: summary.fullExchange }, { label: 'SO Return', value: summary.soReturn }];
            const categoryDetails = (key: 'phone' | 'tablet' | 'tv' | 'speaker') => [{ label: 'Saleout at supermarket', value: totalByCategory[key].saleoutAtSupermarket }, { label: 'CO', value: totalByCategory[key].co }, { label: 'FULL EXCHANGE', value: totalByCategory[key].fullExchange }, { label: 'SO Return', value: totalByCategory[key].soReturn }];

            const spacing = isLimitedView ? 1 : 2; // rows between cards
            let col1CurrentRow = currentRow;
            let col2CurrentRow = currentRow;
            const col2StartC = isLimitedView ? 4 : 6;

            // Column 1 (Starts at Col 0)
            const h_total = createResumeCard(resumeWs, resumeMerges, col1CurrentRow, 0, "TOTAL", "Total Mistake Erablue", totalErablue.total, totalErablueData, 'total', isLimitedView);
            col1CurrentRow += h_total + spacing;
            const h_phone = createResumeCard(resumeWs, resumeMerges, col1CurrentRow, 0, "TOTAL Phone", "Total Mistake Phone", totalByCategory.phone.total, categoryDetails('phone'), 'category', isLimitedView);
            col1CurrentRow += h_phone + spacing;
            createResumeCard(resumeWs, resumeMerges, col1CurrentRow, 0, "TOTAL Tablet", "Total Mistake Tablet", totalByCategory.tablet.total, categoryDetails('tablet'), 'category', isLimitedView);

            // Column 2 (Starts at Col 6 or 4)
            const h_summary = createResumeCard(resumeWs, resumeMerges, col2CurrentRow, col2StartC, "Summary", "Total Mistake Erablue", summary.total, summaryData, 'summary', isLimitedView);
            col2CurrentRow += h_summary + spacing;
            const h_tv = createResumeCard(resumeWs, resumeMerges, col2CurrentRow, col2StartC, "TOTAL TV", "Total Mistake TV", totalByCategory.tv.total, categoryDetails('tv'), 'category', isLimitedView);
            col2CurrentRow += h_tv + spacing;
            createResumeCard(resumeWs, resumeMerges, col2CurrentRow, col2StartC, "TOTAL Speaker", "Total Mistake Speaker", totalByCategory.speaker.total, categoryDetails('speaker'), 'category', isLimitedView);


            const mtdSummaryCols = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
            const cardCols = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }]; // 5 cols for cards

            const finalColWidths = [];
            // We need to cover at least up to col 10 (end of second card) or end of MTD summary
            const maxCols = Math.max(mtdSummaryCols.length, col2StartC + 5);

            for (let i = 0; i < maxCols; i++) {
                let width = 10; // Default
                if (i < mtdSummaryCols.length) width = mtdSummaryCols[i].wch;

                // Override/Ensure width for Card 1 (Cols 0-4)
                if (i < 5) {
                    width = Math.max(width, cardCols[i].wch);
                }
                // Override/Ensure width for Card 2
                if (i >= col2StartC && i < col2StartC + 5) {
                    width = Math.max(width, cardCols[i - col2StartC].wch);
                }

                finalColWidths.push({ wch: width });
            }

            resumeWs['!cols'] = finalColWidths;
            resumeWs['!merges'] = resumeMerges;
            XLSX.utils.book_append_sheet(workbook, resumeWs, t('app.buttons.resume'));
        }

        XLSX.writeFile(workbook, `FIFO_Mistake_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    let title = t('reports.fifo.title');
    if (fifoSummaries && fifoSummaries.length > 0) {
        const mtdTitle = fifoSummaries[0].title;
        const dateMatch = mtdTitle.match(/\| (.*)/);
        if (dateMatch) {
            const formattedDate = dateMatch[1].trim();
            title = t('reports.fifo.excelTitle', { date: formattedDate });
        }
    }

    return (
        <div className="w-full flex flex-col">
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <p className="text-sm text-slate-500">{t('reports.totalRecords', { count: orders.length })}</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 shadow-sm hover:shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed"
                    disabled={orders.length === 0}
                    aria-label={t('reports.downloadAriaLabel')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{t('reports.downloadExcel')}</span>
                </button>
                {onClear && (
                    <button
                        onClick={onClear}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 shadow-sm hover:shadow-md ml-2"
                        aria-label="Refresh Data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('main')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${activeTab === 'main'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {t('app.buttons.mainReport')}
                        </button>
                        <button
                            onClick={() => setActiveTab('underperformed')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${activeTab === 'underperformed'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {t('app.buttons.underperformed')}
                        </button>
                        <button
                            onClick={() => setActiveTab('resume')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${activeTab === 'resume'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {t('app.buttons.resume')}
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'main' && (
                <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full py-2 align-middle px-6">
                        <div className="flex items-start space-x-8">
                            <div className="flex-shrink-0">
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                    <table className="min-w-full border-collapse">
                                        <thead className="align-middle text-sm">
                                            <tr>
                                                <th rowSpan={2} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-blue-800 text-white">{t('reports.tableHeaders.fifo.no')}</th>
                                                <th rowSpan={2} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-blue-800 text-white">{t('reports.tableHeaders.fifo.storeCode')}</th>
                                                <th rowSpan={2} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-blue-800 text-white">{t('reports.tableHeaders.fifo.storeName')}</th>
                                                <th rowSpan={2} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-blue-800 text-white">{t('reports.tableHeaders.am')}</th>
                                                <th colSpan={3} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-yellow-400 text-red-600">PHONE</th>
                                                <th colSpan={3} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-yellow-400 text-red-600">TABLET</th>
                                                <th colSpan={3} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-yellow-400 text-red-600">TV</th>
                                                <th colSpan={3} className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300 bg-yellow-400 text-red-600">SPEAKER</th>
                                            </tr>
                                            <tr className="bg-slate-300 text-slate-800">
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.saleOut')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.mistake')}</th>
                                                <th className="px-2 py-3 text-center align-middle uppercase font-bold border border-slate-300">{t('reports.tableHeaders.fifo.percent')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {orders.map((row, index) => (
                                                <tr key={index} className={row.isSummary ? 'bg-yellow-400 font-bold' : 'hover:bg-blue-50'}>
                                                    {row.isSummary ? (
                                                        <td colSpan={4} className="px-2 py-4 text-sm text-center align-middle uppercase border border-slate-300 text-black">{row.storeName}</td>
                                                    ) : (
                                                        <>
                                                            <td className="px-2 py-4 text-sm text-center align-middle border border-slate-300 text-slate-700">{formatInteger(row.no ?? 0)}</td>
                                                            <td className="px-2 py-4 text-sm text-center align-middle border border-slate-300 text-slate-700">{row.storeId}</td>
                                                            <td className="px-2 py-4 text-sm text-left align-middle border border-slate-300 font-medium text-slate-800">{row.storeName}</td>
                                                            <td className="px-2 py-4 text-sm text-left align-middle border border-slate-300 font-medium text-slate-800">{row.am || ''}</td>
                                                        </>
                                                    )}
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.phoneSaleOut)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.phoneMistake)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle font-semibold border border-slate-300 ${row.phonePercent > 0.03 ? 'bg-yellow-300 text-red-600' : row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatPercent(row.phonePercent)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.tabletSaleOut)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.tabletMistake)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle font-semibold border border-slate-300 ${row.tabletPercent > 0.05 ? 'bg-yellow-300 text-red-600' : row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatPercent(row.tabletPercent)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.tvSaleOut)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.tvMistake)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle font-semibold border border-slate-300 ${row.tvPercent > 0.05 ? 'bg-yellow-300 text-red-600' : row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatPercent(row.tvPercent)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.speakerSaleOut)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle border border-slate-300 ${row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatInteger(row.speakerMistake)}</td>
                                                    <td className={`px-2 py-4 text-sm text-center align-middle font-semibold border border-slate-300 ${row.speakerPercent > 0.05 ? 'bg-yellow-300 text-red-600' : row.isSummary ? 'text-black' : 'text-slate-700'}`}>{formatPercent(row.speakerPercent)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {fifoSummaries && fifoSummaries.length > 0 && (
                                <div className="flex-shrink-0 space-y-6">
                                    {fifoSummaries.map((summary, index) => (
                                        <SummaryTable key={index} summary={summary} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'underperformed' && underperformedData && (
                <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full py-2 align-middle px-6">
                        <div className="flex space-x-8 pb-4">
                            {underperformedData.phone.length > 0 && <div className="flex-shrink-0"><UnderperformedCategoryTable categoryName="PHONE" data={underperformedData.phone} /></div>}
                            {underperformedData.tv.length > 0 && <div className="flex-shrink-0"><UnderperformedCategoryTable categoryName="TV" data={underperformedData.tv} /></div>}
                            {underperformedData.speaker.length > 0 && <div className="flex-shrink-0"><UnderperformedCategoryTable categoryName="SPEAKER" data={underperformedData.speaker} /></div>}
                            {underperformedData.tablet.length > 0 && <div className="flex-shrink-0"><UnderperformedCategoryTable categoryName="TABLET" data={underperformedData.tablet} /></div>}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'resume' && resumeData && (
                <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full py-2 align-middle px-6">
                        <FifoResumeTable resumeData={resumeData} isLimitedView={isLimitedView} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FifoReportTable;