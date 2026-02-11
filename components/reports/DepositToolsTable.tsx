import React, { useMemo } from 'react';
import { DepositToolsData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import VirtualTable from '../VirtualTable';
// @ts-ignore
import XLSX from 'xlsx-js-style';

interface DepositToolsTableProps {
  orders: DepositToolsData[];
  fileName: string | null;
}

const DepositToolsTable: React.FC<DepositToolsTableProps> = ({ orders, fileName }) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
      return '-';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
    }).format(amount);
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const columns = useMemo(() => [
    {
      header: t('reports.tableHeaders.depositTools.store'),
      accessor: (row: DepositToolsData) => (
        <span className={row.checkDay > 15 ? 'text-red-600 font-medium' : 'font-medium text-slate-900'}>
          {row.store}
        </span>
      ),
      width: 250,
    },
    {
      header: t('reports.tableHeaders.depositTools.inOutVoucher'),
      accessor: (row: DepositToolsData) => (
        <span className={row.checkDay > 15 ? 'text-red-600' : ''}>
          {row.inOutVoucher}
        </span>
      ),
      width: 150,
    },
    {
      header: t('reports.tableHeaders.depositTools.customerName'),
      accessor: (row: DepositToolsData) => (
        <span className={row.checkDay > 15 ? 'text-red-600' : ''}>
          {row.customerName}
        </span>
      ),
      width: 180,
    },
    {
      header: t('reports.tableHeaders.depositTools.date'),
      accessor: (row: DepositToolsData) => (
        <span className={row.checkDay > 15 ? 'text-red-600' : ''}>
          {formatDate(row.date)}
        </span>
      ),
      width: 100,
    },
    {
      header: t('reports.tableHeaders.depositTools.checkDay'),
      accessor: (row: DepositToolsData) => (
        <span className={`text-center block ${row.checkDay > 15 ? 'text-red-600' : ''}`}>
          {row.checkDay}
        </span>
      ),
      className: 'text-center',
      width: 80,
    },
    {
      header: t('reports.tableHeaders.depositTools.paymentAmount'),
      accessor: (row: DepositToolsData) => (
        <span className={`font-mono text-right block ${row.checkDay > 15 ? 'text-red-600' : ''}`}>
          {formatCurrency(row.paymentAmount)}
        </span>
      ),
      className: 'text-right',
      width: 120,
    },
    {
      header: t('reports.tableHeaders.depositTools.content'),
      accessor: (row: DepositToolsData) => (
        <span className={row.checkDay > 15 ? 'text-red-600' : ''}>
          {row.content}
        </span>
      ),
      width: 300,
    },
    {
      header: t('reports.tableHeaders.am'),
      accessor: (row: DepositToolsData) => (
        <span className={`text-center block ${row.checkDay > 15 ? 'text-red-600' : ''}`}>
          {row.am}
        </span>
      ),
      className: 'text-center',
      width: 120,
    },
  ], [t]);

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const thinBorder = { style: "thin", color: { rgb: "000000" } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const cellStyle = { border: border, alignment: { vertical: "center" } };
    const centeredCellStyle = { ...cellStyle, alignment: { ...cellStyle.alignment, horizontal: "center" } };
    const headerAlignment = { alignment: { horizontal: "center", vertical: "center", wrapText: true } };

    const headers = {
      store: t('reports.tableHeaders.depositTools.store'),
      inOutVoucher: t('reports.tableHeaders.depositTools.inOutVoucher'),
      customerName: t('reports.tableHeaders.depositTools.customerName'),
      date: t('reports.tableHeaders.depositTools.date'),
      checkDay: t('reports.tableHeaders.depositTools.checkDay'),
      paymentAmount: t('reports.tableHeaders.depositTools.paymentAmount'),
      content: t('reports.tableHeaders.depositTools.content'),
      am: t('reports.tableHeaders.am'),
    };

    const dataToExport = orders.map(order => ({
      [headers.store]: order.store,
      [headers.inOutVoucher]: order.inOutVoucher,
      [headers.customerName]: order.customerName,
      [headers.date]: formatDate(order.date),
      [headers.checkDay]: order.checkDay,
      [headers.paymentAmount]: order.paymentAmount,
      [headers.content]: order.content,
      [headers.am]: order.am,
    }));
    const columnWidths = [{ wch: 45 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 20 }];
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, border: border, ...headerAlignment };

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let c = range.s.c; c <= range.e.c; ++c) {
      const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c });
      worksheet[headerCellAddress].s = headerStyle;
    }

    for (let r = range.s.r + 1; r <= range.e.r; ++r) {
      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };

        // Apply red text if checkDay > 15 (Check Day is at index 4 in dataToExport / orders)
        // Note: dataToExport is an array of objects. We need to check the checkDay of the current row order.
        // But here we are iterating cells.
        // It's safer to use the dataToExport array index.
        const rowIndex = r - 1; // 0-based index for data array
        const rowData = orders[rowIndex];

        const isUrgent = rowData && rowData.checkDay > 15;
        const fontStyle = isUrgent ? { color: { rgb: "FF0000" } } : { color: { rgb: "000000" } };

        let currentStyle = { ...cellStyle, font: fontStyle };

        if (c === 5) { // Payment amount column
          worksheet[cellAddress].t = 'n';
          worksheet[cellAddress].s = { ...currentStyle, numFmt: "#,##0" };
        } else if (c === 4 || c === 7) { // Check Day and AM columns
          worksheet[cellAddress].s = { ...currentStyle, ...centeredCellStyle.alignment }; // Mix alignment safely
          // Re-apply alignment because currentStyle overwrites it with default cellStyle
          worksheet[cellAddress].s = { ...currentStyle, alignment: { vertical: "center", horizontal: "center" } };

        } else {
          worksheet[cellAddress].s = currentStyle;
        }
      }
    }
    worksheet['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.depositTools.title'));

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Deposit_Tools_Report_${today}.xlsx`);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
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

      <VirtualTable
        key={orders.length}
        data={orders}
        columns={columns}
        estimateSize={50}
        overscan={10}
        headerClassName="bg-blue-800"
      />
    </div>
  );
};

export default DepositToolsTable;