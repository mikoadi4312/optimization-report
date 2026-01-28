import React, { useMemo } from 'react';
import { RevenueStaffRow } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import VirtualTable from '../VirtualTable';

// @ts-ignore
import XLSX from 'xlsx-js-style';

interface RevenueStaffTableProps {
  orders: RevenueStaffRow[];
  fileName: string | null;
}

const RevenueStaffTable: React.FC<RevenueStaffTableProps> = ({ orders }) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
      return '-';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
    }).format(amount);
  };

  const headers = orders.length > 0 ? Object.keys(orders[0]) : [];

  const getTranslatedHeader = (header: string) => {
    if (header.includes('STAR')) return header.replace('STAR', t('reports.tableHeaders.revenueStaff.star'));
    if (header.includes('BOTTOM')) return header.replace('BOTTOM', t('reports.tableHeaders.revenueStaff.bottom'));
    const headerKey = `reports.tableHeaders.revenueStaff.${header.toLowerCase().replace(/ /g, '')}`;
    const translated = t(headerKey);
    return translated === headerKey ? header : translated;
  };

  const columns = useMemo(() =>
    headers.map((header, index) => ({
      header: getTranslatedHeader(header),
      accessor: (row: RevenueStaffRow) => {
        const value = row[header];
        const isStarOrBottom = header.includes('STAR') || header.includes('BOTTOM');
        const isNumber = typeof value === 'number' && !header.includes('NO');

        if (isStarOrBottom) {
          return <span className="block text-center">{value}</span>;
        }
        if (isNumber) {
          return <span className="font-mono">{formatCurrency(value as number)}</span>;
        }
        return value;
      },
      className: header.includes('STAR') || header.includes('BOTTOM') ? 'text-center' : '',
      headerClassName: index > 3 ? 'bg-orange-300' : 'bg-green-300',
    }))
    , [headers, t]);

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const thinBorder = { style: "thin", color: { rgb: "000000" } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const cellStyle = { border: border, alignment: { vertical: "center" } };
    const headerAlignment = { alignment: { horizontal: "center", vertical: "center", wrapText: true } };

    if (orders.length === 0) return;

    const originalHeaders = Object.keys(orders[0]);
    const translatedHeaders = originalHeaders.map(h => {
      if (h.includes('STAR')) return h.replace('STAR', t('reports.tableHeaders.revenueStaff.star'));
      if (h.includes('BOTTOM')) return h.replace('BOTTOM', t('reports.tableHeaders.revenueStaff.bottom'));
      const headerKey = `reports.tableHeaders.revenueStaff.${h.toLowerCase().replace(/ /g, '')}`;
      const translated = t(headerKey);
      return translated === headerKey ? h : translated;
    });

    const dataToExport = orders.map(row => {
      const newRow: { [key: string]: any } = {};
      originalHeaders.forEach((originalHeader, index) => {
        const newHeader = translatedHeaders[index];
        newRow[newHeader] = row[originalHeader];
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: translatedHeaders });
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    const mainHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "A9D08E" } }, border: border, ...headerAlignment };
    const monthHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "F4B084" } }, border: border, ...headerAlignment };

    for (let c = range.s.c; c <= range.e.c; ++c) {
      const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c })];
      if (c < 4) {
        headerCell.s = mainHeaderStyle;
      } else {
        headerCell.s = monthHeaderStyle;
      }
    }

    for (let r = range.s.r + 1; r <= range.e.r; ++r) {
      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        const header = translatedHeaders[c];
        let currentStyle: any = { ...cellStyle };

        if (header.includes(t('reports.tableHeaders.revenueStaff.star')) || header.includes(t('reports.tableHeaders.revenueStaff.bottom'))) {
          currentStyle.alignment = { ...currentStyle.alignment, horizontal: "center" };
        } else if (c > 3) {
          if (typeof cell.v === 'number') {
            cell.t = 'n';
            currentStyle.numFmt = "#,##0";
          }
        }
        cell.s = currentStyle;
      }
    }

    worksheet['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 45 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.revenueStaff.title'));

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Revenue_Staff_Report_${today}.xlsx`);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
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

export default RevenueStaffTable;