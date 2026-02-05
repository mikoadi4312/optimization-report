import React, { useMemo } from 'react';
import { IncentiveStaffRow } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import VirtualTable from '../VirtualTable';

// @ts-ignore
import XLSX from 'xlsx-js-style';

interface IncentiveStaffTableProps {
  orders: IncentiveStaffRow[];
  fileName: string | null;
}

const IncentiveStaffTable: React.FC<IncentiveStaffTableProps> = ({ orders, fileName }) => {
  const { t } = useLanguage();

  const headers = orders.length > 0 ? Object.keys(orders[0]) : [];
  const productHeaders = headers.filter(h => h !== 'staff' && h !== 'total');

  // Grand Totals
  const grandTotal = useMemo(() => {
    const totals: { [key: string]: number } = { total: 0 };
    productHeaders.forEach(h => totals[h] = 0);

    orders.forEach(order => {
      totals.total += order.total;
      productHeaders.forEach(header => {
        totals[header] += (order[header] as number) || 0;
      });
    });
    return totals;
  }, [orders, productHeaders]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
      return '-';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
    }).format(amount);
  };

  const columns = useMemo(() => [
    {
      header: t('reports.tableHeaders.incentiveStaff.staff'),
      accessor: 'staff' as keyof IncentiveStaffRow,
      className: 'font-medium text-slate-900',
      headerClassName: 'bg-yellow-200',
      width: 250,
    },
    ...productHeaders.map(productHeader => ({
      header: productHeader,
      accessor: (row: IncentiveStaffRow) => (
        <span className="font-mono">{formatCurrency(row[productHeader] as number)}</span>
      ),
      className: 'text-right',
      headerClassName: 'bg-blue-200',
      width: 150,
    })),
    {
      header: t('reports.tableHeaders.incentiveStaff.total'),
      accessor: (row: IncentiveStaffRow) => (
        <span className="font-mono font-bold">{formatCurrency(row.total as number)}</span>
      ),
      className: 'text-right',
      headerClassName: 'bg-blue-200',
      width: 200,
    },
  ], [productHeaders, t]);

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const thinBorder = { style: "thin", color: { rgb: "000000" } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const headerAlignment = { alignment: { horizontal: "center", vertical: "center", wrapText: true } };

    const excelHeaders = [
      t('reports.tableHeaders.incentiveStaff.staff'),
      ...productHeaders,
      t('reports.tableHeaders.incentiveStaff.total'),
    ];

    const dataToExport = orders.map(order => {
      const row: (string | number)[] = [order.staff];
      productHeaders.forEach(h => {
        const val = order[h] as number;
        row.push(val);
      });
      row.push(order.total);
      return row;
    });

    const grandTotalRowForExport: (string | number)[] = [t('reports.tableHeaders.grandTotal')];
    productHeaders.forEach(h => grandTotalRowForExport.push(grandTotal[h]));
    grandTotalRowForExport.push(grandTotal.total);

    const worksheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...dataToExport, grandTotalRowForExport]);

    const staffHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, border: border, ...headerAlignment };
    const otherHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "BDD7EE" } }, border: border, ...headerAlignment };

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let c = range.s.c; c <= range.e.c; ++c) {
      const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c });
      worksheet[headerCellAddress].s = c === 0 ? staffHeaderStyle : otherHeaderStyle;
    }

    for (let r = range.s.r + 1; r < range.e.r; ++r) {
      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        if (c > 0) {
          cell.t = 'n';
          cell.s = { border: border, alignment: { horizontal: "center", vertical: "center" }, numFmt: "#,##0;(#,##0);\"-\"" };
        } else {
          cell.s = { border: border, alignment: { vertical: "center" } };
        }
      }
    }

    const grandTotalRowIndex = range.e.r;
    const grandTotalStyle = { font: { bold: true }, border: border, fill: { fgColor: { rgb: "D9D9D9" } } };
    for (let c = range.s.c; c <= range.e.c; ++c) {
      const cellAddress = XLSX.utils.encode_cell({ r: grandTotalRowIndex, c });
      const cell = worksheet[cellAddress];
      if (!cell) continue;
      if (c > 0) {
        cell.t = 'n';
        cell.s = { ...grandTotalStyle, alignment: { horizontal: "center", vertical: "center" }, numFmt: "#,##0;(#,##0);\"-\"" };
      } else {
        cell.s = { ...grandTotalStyle, alignment: { vertical: "center" } };
      }
    }

    const colWidths = [
      { wch: 30 },
      ...productHeaders.map(() => ({ wch: 15 })),
      { wch: 20 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.incentiveStaff.title'));

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Incentive_Staff_Report_${today}.xlsx`);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          {fileName && <p className="text-sm text-slate-500">{t('reports.sourceFile')}: <span className="font-medium">{fileName}</span></p>}
          <p className="text-sm text-slate-500">{t('reports.totalRecords', { count: orders.length })}</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 shadow-sm hover:shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed"
          disabled={orders.length === 0}
          aria-label={t('reports.downloadAriaLabel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{t('reports.downloadExcel')}</span>
        </button>
      </div>

      {/* Grand Total Summary */}
      <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-700">{t('reports.tableHeaders.grandTotal')}:</span>
          <span className="font-mono text-xl font-bold text-blue-600">{formatCurrency(grandTotal.total)}</span>
        </div>
      </div>

      <VirtualTable
        data={orders}
        columns={columns}
        estimateSize={50}
        overscan={10}
      />
    </div>
  );
};

export default IncentiveStaffTable;