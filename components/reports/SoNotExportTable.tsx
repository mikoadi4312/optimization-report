import React, { useMemo } from 'react';
import { SaleOrder } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import VirtualTable from '../VirtualTable';

// @ts-ignore
import XLSX from 'xlsx-js-style';

interface SoNotExportTableProps {
  orders: SaleOrder[];
  fileName: string | null;
}

const SoNotExportTable: React.FC<SoNotExportTableProps> = ({ orders, fileName }) => {
  const { t } = useLanguage();

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
      header: t('reports.tableHeaders.soNotExport.orderCode'),
      accessor: 'orderCode' as keyof SaleOrder,
      className: 'font-medium text-slate-900',
    },
    {
      header: t('reports.tableHeaders.soNotExport.customerName'),
      accessor: 'customerName' as keyof SaleOrder,
    },
    {
      header: t('reports.tableHeaders.soNotExport.createdDate'),
      accessor: 'createdDate' as keyof SaleOrder,
    },
    {
      header: t('reports.tableHeaders.soNotExport.deliveryDate'),
      accessor: 'deliveryDate' as keyof SaleOrder,
    },
    {
      header: t('reports.tableHeaders.soNotExport.outputStore'),
      accessor: 'outputStore' as keyof SaleOrder,
      className: 'max-w-xs truncate',
    },
    {
      header: t('reports.tableHeaders.soNotExport.totalAmount'),
      accessor: (row: SaleOrder) => (
        <span className="font-mono text-right block">{formatCurrency(row.totalAmount as number)}</span>
      ),
      className: 'text-right',
    },
  ], [t]);

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const thinBorder = { style: "thin", color: { rgb: "000000" } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const cellStyle = { border: border, alignment: { vertical: "center" } };
    const headerAlignment = { alignment: { horizontal: "center", vertical: "center", wrapText: true } };

    const headers = {
      orderCode: t('reports.tableHeaders.soNotExport.orderCode'),
      customerName: t('reports.tableHeaders.soNotExport.customerName'),
      createdDate: t('reports.tableHeaders.soNotExport.createdDate'),
      deliveryDate: t('reports.tableHeaders.soNotExport.deliveryDate'),
      outputStore: t('reports.tableHeaders.soNotExport.outputStore'),
      totalAmount: t('reports.tableHeaders.soNotExport.totalAmount'),
    };

    const dataToExport = orders.map(order => ({
      [headers.orderCode]: order.orderCode,
      [headers.customerName]: order.customerName,
      [headers.createdDate]: order.createdDate,
      [headers.deliveryDate]: order.deliveryDate,
      [headers.outputStore]: order.outputStore,
      [headers.totalAmount]: order.totalAmount,
    }));

    const columnWidths = [{ wch: 25 }, { wch: 30 }, { wch: 22 }, { wch: 22 }, { wch: 45 }, { wch: 20 }];
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "DDEBF7" } }, border: border, ...headerAlignment };

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let c = range.s.c; c <= range.e.c; ++c) {
      const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c });
      worksheet[headerCellAddress].s = headerStyle;
    }

    for (let r = range.s.r + 1; r <= range.e.r; ++r) {
      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '', s: cellStyle };
        worksheet[cellAddress].s = cellStyle;

        if (c === 5) { // Total Amount column
          worksheet[cellAddress].t = 'n';
          worksheet[cellAddress].s = { ...cellStyle, numFmt: "#,##0" };
        }
      }
    }
    worksheet['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.soNotExport.title'));

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Sales_Order_Report_${today}.xlsx`);
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
        data={orders}
        columns={columns}
        estimateSize={50}
        overscan={10}
      />
    </div>
  );
};

export default SoNotExportTable;