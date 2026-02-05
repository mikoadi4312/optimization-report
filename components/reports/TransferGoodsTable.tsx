import React from 'react';
import { TransferGoodsData, AMSummaryData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// @ts-ignore
import XLSX from 'xlsx-js-style';

interface TransferGoodsTableProps {
  orders: TransferGoodsData[];
  summaryData?: AMSummaryData[];
  fileName: string | null;
}

const AMSummaryTable: React.FC<{ summaryData: AMSummaryData[] }> = ({ summaryData }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-blue-800">
          <tr>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">{t('reports.tableHeaders.am')}</th>
            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">{t('reports.tableHeaders.transferGoods.outputStore')}</th>
            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">{t('reports.tableHeaders.transferGoods.inputStore')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {summaryData.map((item, index) => (
            <tr key={item.am + index} className="hover:bg-blue-50">
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">{item.am}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-slate-600">{item.outputStore}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-slate-600">{item.inputStore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TransferGoodsTable: React.FC<TransferGoodsTableProps> = ({ orders, summaryData, fileName }) => {
  const { t } = useLanguage();

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const thinBorder = { style: "thin", color: { rgb: "000000" } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const cellStyle = { border: border, alignment: { vertical: "center" } };
    const centeredCellStyle = { ...cellStyle, alignment: { ...cellStyle.alignment, horizontal: "center" } };
    const headerAlignment = { alignment: { horizontal: "center", vertical: "center", wrapText: true } };

    const headers = {
      transportVoucher: t('reports.tableHeaders.transferGoods.transportVoucher'),
      outputStore: t('reports.tableHeaders.transferGoods.outputStore'),
      outputCity: t('reports.tableHeaders.transferGoods.outputCity'),
      inputStore: t('reports.tableHeaders.transferGoods.inputStore'),
      inputCity: t('reports.tableHeaders.transferGoods.inputCity'),
      transferStoreDate: t('reports.tableHeaders.transferGoods.transferStoreDate'),
      inventoryStatus: t('reports.tableHeaders.transferGoods.inventoryStatus'),
      dateFromTransfer: t('reports.tableHeaders.transferGoods.dateFromTransfer'),
      amOutputStore: t('reports.tableHeaders.transferGoods.amOutputStore'),
      amInputStore: t('reports.tableHeaders.transferGoods.amInputStore'),
    };

    const dataToExport = orders.map(order => ({
      [headers.transportVoucher]: order.transportVoucher,
      [headers.outputStore]: order.outputStore,
      [headers.outputCity]: order.outputCity,
      [headers.inputStore]: order.inputStore,
      [headers.inputCity]: order.inputCity,
      [headers.transferStoreDate]: order.transferStoreDate,
      [headers.inventoryStatus]: order.inventoryStatus,
      [headers.dateFromTransfer]: order.dateFromTransfer,
      [headers.amOutputStore]: order.amOutputStore,
      [headers.amInputStore]: order.amInputStore
    }));
    const mainColumnWidths = [{ wch: 25 }, { wch: 45 }, { wch: 25 }, { wch: 45 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    const mainHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } }, border: border, ...headerAlignment };

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    const mainRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let c = mainRange.s.c; c <= mainRange.e.c; ++c) {
      const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c });
      worksheet[headerCellAddress].s = mainHeaderStyle;
    }
    const redFont = { color: { rgb: "FF0000" } };
    const redCellStyle = { ...cellStyle, font: redFont };
    const redCenteredCellStyle = { ...centeredCellStyle, font: redFont };

    for (let r = mainRange.s.r + 1; r <= mainRange.e.r; ++r) {
      const orderIndex = r - (mainRange.s.r + 1);
      const order = orders[orderIndex];
      const isOverdue = order && order.dateFromTransfer > 15;

      for (let c = mainRange.s.c; c <= mainRange.e.c; ++c) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };

        let currentStyle = cellStyle;
        if ([7, 8, 9].includes(c)) { // Date From Transfer, AM Output, AM Input
          currentStyle = centeredCellStyle;
        }

        if (isOverdue) {
          if (currentStyle === centeredCellStyle) {
            currentStyle = redCenteredCellStyle;
          } else {
            currentStyle = redCellStyle;
          }
        }

        worksheet[cellAddress].s = currentStyle;
      }
    }

    let finalColumnWidths = [...mainColumnWidths];

    if (summaryData && summaryData.length > 0) {
      const summaryStartCol = mainColumnWidths.length + 2;

      const summaryHeaders = [[t('reports.tableHeaders.am'), t('reports.tableHeaders.transferGoods.outputStore'), t('reports.tableHeaders.transferGoods.inputStore')]];
      const summaryBody = summaryData.map(item => [item.am, item.outputStore, item.inputStore]);
      const summaryAOA = [...summaryHeaders, ...summaryBody];

      XLSX.utils.sheet_add_aoa(worksheet, summaryAOA, { origin: { r: 0, c: summaryStartCol } });

      const summaryHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "DDEBF7" } }, border: border, ...headerAlignment };

      for (let c = 0; c < summaryHeaders[0].length; ++c) {
        const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c: summaryStartCol + c });
        if (worksheet[headerCellAddress]) worksheet[headerCellAddress].s = summaryHeaderStyle;
      }

      for (let r = 0; r < summaryBody.length; ++r) {
        for (let c = 0; c < summaryBody[r].length; ++c) {
          const cellAddress = XLSX.utils.encode_cell({ r: r + 1, c: summaryStartCol + c });
          if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 'n', v: 0 };

          if (c > 0) {
            worksheet[cellAddress].s = centeredCellStyle;
          } else {
            worksheet[cellAddress].s = cellStyle;
          }
        }
      }

      const summaryColumnWidths = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
      finalColumnWidths.push({ wch: 2 }, { wch: 2 });
      finalColumnWidths.push(...summaryColumnWidths);
    }

    worksheet['!cols'] = finalColumnWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.transferGoods.title'));

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Transfer_Goods_Report_${today}.xlsx`);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          {fileName && <p className="text-sm text-slate-500">{t('reports.sourceFile')}: <span className="font-medium">{fileName}</span></p>}
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
      </div>
      <div className="flex flex-col gap-8">
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full py-2 align-middle px-6">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">{t('reports.tableHeaders.transferGoods.transportVoucher')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">{t('reports.tableHeaders.transferGoods.outputStore')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">{t('reports.tableHeaders.transferGoods.outputCity')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">{t('reports.tableHeaders.transferGoods.inputStore')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">{t('reports.tableHeaders.transferGoods.inputCity')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">{t('reports.tableHeaders.transferGoods.transferStoreDate')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">{t('reports.tableHeaders.transferGoods.inventoryStatus')}</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold">{t('reports.tableHeaders.transferGoods.dateFromTransfer')}</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold">{t('reports.tableHeaders.transferGoods.amOutputStore')}</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold sm:pr-6">{t('reports.tableHeaders.transferGoods.amInputStore')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {orders.map((order, index) => (
                    <tr key={order.transportVoucher + index} className={`hover:bg-blue-50 transition-colors ${order.dateFromTransfer > 15 ? 'text-red-600' : ''}`}>
                      <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-900'}`}>{order.transportVoucher}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.outputStore}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.outputCity}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.inputStore}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.inputCity}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.transferStoreDate}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.inventoryStatus}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm text-center ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.dateFromTransfer}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm text-center ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.amOutputStore || '-'}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm text-center sm:pr-6 ${order.dateFromTransfer > 15 ? 'text-red-600' : 'text-slate-600'}`}>{order.amInputStore || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          {summaryData && summaryData.length > 0 && <AMSummaryTable summaryData={summaryData} />}
        </div>
      </div>
    </div>
  );
};

export default TransferGoodsTable;