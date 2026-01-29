import React from 'react';
import { FifoResumeData, FifoSummaryRow, FifoWeeklySummary, FifoDetailCounts } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// Helper function to format numbers, ensuring 0 is displayed for zero values.
const formatInteger = (num: number | undefined) => {
    if (num === undefined) return '0';
    return new Intl.NumberFormat('id-ID', {
        style: 'decimal',
        maximumFractionDigits: 0,
    }).format(num);
};

// Helper function to calculate and format percentages.
const formatPercent = (value: number, total?: number) => {
    if (total !== undefined) { // For ResumeCard, calculate from parts
        if (total === 0 || value === 0) return '0%';
        return `${Math.round((value / total) * 100)}%`;
    }
    // For MTDSummaryTable, value is already a pre-calculated percentage
    return `${(value * 100).toFixed(0)}%`;
};


// Component for the MTD Summary table (like in the main report tab)
const MTDSummaryTable: React.FC<{ summary: FifoWeeklySummary }> = ({ summary }) => {
    const { t } = useLanguage();

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
                            <tr key={index} className={isPerformanceRow(row) ? 'bg-yellow-300 font-bold text-red-600' : 'hover:bg-blue-50 text-black'}>
                                <td className={`px-2 py-2 text-sm text-left border border-slate-300`}>{row.am.toUpperCase()}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.phoneSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.phoneMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${!isPerformanceRow(row) && row.phonePercent > 0.03 ? 'bg-yellow-300 text-red-600' : ''}`}>{formatPercent(row.phonePercent)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.tabletSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.tabletMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${!isPerformanceRow(row) && row.tabletPercent > 0.05 ? 'bg-yellow-300 text-red-600' : ''}`}>{formatPercent(row.tabletPercent)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.tvSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.tvMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${!isPerformanceRow(row) && row.tvPercent > 0.05 ? 'bg-yellow-300 text-red-600' : ''}`}>{formatPercent(row.tvPercent)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.speakerSaleOut)}</td>
                                <td className={`px-2 py-2 text-sm text-center border border-slate-300`}>{formatInteger(row.speakerMistake)}</td>
                                <td className={`px-2 py-2 text-sm text-center font-semibold border border-slate-300 ${!isPerformanceRow(row) && row.speakerPercent > 0.05 ? 'bg-yellow-300 text-red-600' : ''}`}>{formatPercent(row.speakerPercent)}</td>
                                {hasTotalMistakeColumn && <td className={`px-2 py-2 text-sm text-center font-bold border border-slate-300 text-red-600`}>{formatPercent(row.totalMistakePercent ?? 0)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// Reusable card component for each summary table shown in the image.
interface ResumeCardProps {
    title: string;
    totalLabel: string;
    totalValue: number;
    data: { label: string; value: number }[];
    type: 'total' | 'summary' | 'category';
    isLimitedView?: boolean;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ title, totalLabel, totalValue, data, type, isLimitedView = false }) => {
    // Sort data by value descending
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // This function applies specific background colors to rows to match the user's image.
    // We apply it to the sorted index to maintain the visual pattern.
    const getRowClass = (index: number) => {
        switch (type) {
            case 'total': // For the main 'TOTAL' table
                return (index === 0 || index === 2) ? 'bg-slate-100' : 'bg-white';
            case 'summary': // For the 'Summary' table
                return index === 2 ? 'bg-slate-100' : 'bg-white';
            case 'category': // For all category-specific tables
            default:
                return 'bg-white';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5 overflow-hidden">

            <table className="w-full text-sm border-collapse">
                <thead className="bg-yellow-400 font-bold">
                    <tr>
                        <th className="p-2 border border-slate-300 text-left text-black">{totalLabel}</th>
                        <th className="p-2 border border-slate-300 text-right text-red-600">{formatInteger(totalValue)}</th>
                        <th className="p-2 border border-slate-300 text-right text-black">%</th>
                        {!isLimitedView && <th className="p-2 border border-slate-300 text-center text-black">Status</th>}
                        {!isLimitedView && <th className="p-2 border border-slate-300 text-center text-black">Indicator</th>}
                    </tr>
                </thead>
                <tbody className="text-black">
                    {sortedData.map((row, index) => (
                        <tr key={row.label} className={getRowClass(index)}>
                            <td className="p-2 border border-slate-300">{row.label}</td>
                            <td className="p-2 border border-slate-300 text-right">{formatInteger(row.value)}</td>
                            <td className="p-2 border border-slate-300 text-right font-semibold">{formatPercent(row.value, totalValue)}</td>
                            {!isLimitedView && (
                                <td className="p-2 border border-slate-300 text-center font-bold">
                                    {row.value > 10 ? <span className="text-red-600">Urgent</span> : ''}
                                </td>
                            )}
                            {!isLimitedView && (
                                <td className="p-2 border border-slate-300 text-center text-lg">
                                    {row.value > 5 ? '😕' : '⭐'}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Main component to arrange the cards in a grid as per the user's image.
const FifoResumeTable: React.FC<{ resumeData: FifoResumeData; isLimitedView?: boolean }> = ({ resumeData, isLimitedView = false }) => {
    const { mtdSummary, totalErablue, totalByCategory, summary } = resumeData;

    // Prepare data for the 'TOTAL' card
    const totalErablueData = [
        { label: 'Phone', value: totalErablue.phone },
        { label: 'Tablet', value: totalErablue.tablet },
        { label: 'TV', value: totalErablue.tv },
        { label: 'Speaker', value: totalErablue.speaker },
    ];

    // Prepare data for the 'Summary' card
    const summaryData = [
        { label: 'Saleout at supermarket', value: summary.saleoutAtSupermarket },
        { label: 'CO', value: summary.co },
        { label: 'FULL EXCHANGE', value: summary.fullExchange },
        { label: 'SO Return', value: summary.soReturn },
    ];

    // Function to prepare data for category-specific cards (Phone, TV, etc.)
    const categoryDetails = (categoryKey: 'phone' | 'tablet' | 'tv' | 'speaker') => [
        { label: 'Saleout at supermarket', value: totalByCategory[categoryKey].saleoutAtSupermarket },
        { label: 'CO', value: totalByCategory[categoryKey].co },
        { label: 'FULL EXCHANGE', value: totalByCategory[categoryKey].fullExchange },
        { label: 'SO Return', value: totalByCategory[categoryKey].soReturn },
    ];

    return (
        <div className={isLimitedView ? "space-y-4" : "space-y-8"}>
            {mtdSummary && <MTDSummaryTable summary={mtdSummary} />}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isLimitedView ? 'gap-4' : 'gap-8'} items-start`}>
                <div className={isLimitedView ? "space-y-4" : "space-y-8"}>
                    <ResumeCard title="TOTAL" totalLabel="Total Mistake Erablue" totalValue={totalErablue.total} data={totalErablueData} type="total" isLimitedView={isLimitedView} />
                    <ResumeCard title="TOTAL Phone" totalLabel="Total Mistake Phone" totalValue={totalByCategory.phone.total} data={categoryDetails('phone')} type="category" isLimitedView={isLimitedView} />
                    <ResumeCard title="TOTAL Tablet" totalLabel="Total Mistake Tablet" totalValue={totalByCategory.tablet.total} data={categoryDetails('tablet')} type="category" isLimitedView={isLimitedView} />
                </div>
                <div className={isLimitedView ? "space-y-4" : "space-y-8"}>
                    <ResumeCard title="Summary" totalLabel="Total Mistake Erablue" totalValue={summary.total} data={summaryData} type="summary" isLimitedView={isLimitedView} />
                    <ResumeCard title="TOTAL TV" totalLabel="Total Mistake TV" totalValue={totalByCategory.tv.total} data={categoryDetails('tv')} type="category" isLimitedView={isLimitedView} />
                    <ResumeCard title="TOTAL Speaker" totalLabel="Total Mistake Speaker" totalValue={totalByCategory.speaker.total} data={categoryDetails('speaker')} type="category" isLimitedView={isLimitedView} />
                </div>
            </div>

        </div>
    );
};

export default FifoResumeTable;