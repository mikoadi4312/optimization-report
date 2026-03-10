/**
 * voucherExcelExport.ts
 * Export data VoucherRow ke Excel dengan 3 kolom: Receipt Code, Applied Value, Expired Day.
 *
 * Styling:
 *   - Header: background biru tua (#1E3A5F), teks putih, rata tengah, bold
 *   - Semua sel: border tipis
 */

// @ts-ignore
import XLSX from 'xlsx-js-style';
import { VoucherRow } from '../../types';

// ── Style Definitions ──────────────────────────────────────────────────────

const HEADER_STYLE = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Calibri' },
    fill: { fgColor: { rgb: '1E3A5F' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
    border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
    },
};

const DATA_BORDER = {
    top: { style: 'thin', color: { rgb: 'D0D0D0' } },
    bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
    left: { style: 'thin', color: { rgb: 'D0D0D0' } },
    right: { style: 'thin', color: { rgb: 'D0D0D0' } },
};

const cell = (value: string, align: 'left' | 'center' | 'right' = 'left') => ({
    v: value,
    t: 's',
    s: {
        font: { sz: 11, name: 'Calibri' },
        alignment: { horizontal: align, vertical: 'center' },
        border: DATA_BORDER,
    },
});

// ── Exported Function ──────────────────────────────────────────────────────

/**
 * Ekspor array VoucherRow ke file Excel.
 *
 * @param data      Data voucher hasil ekstraksi
 * @param fileName  Nama file output (tanpa ekstensi)
 */
export const exportVouchersToExcel = (
    data: VoucherRow[],
    fileName: string = 'Voucher_Extract'
): void => {
    if (!data || data.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
    }

    const wb = XLSX.utils.book_new();

    // ── Header Row ──
    const headerRow = [
        { v: 'Receipt Code', t: 's', s: HEADER_STYLE },
        { v: 'Applied Value', t: 's', s: HEADER_STYLE },
        { v: 'Expired Day', t: 's', s: HEADER_STYLE },
    ];

    // ── Data Rows ──
    const dataRows = data.map((row) => [
        cell(row.receiptCode, 'left'),
        cell(row.appliedValue, 'right'),
        cell(row.expiredDay, 'center'),
    ]);

    // ── Build Worksheet ──
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

    // Lebar kolom
    ws['!cols'] = [
        { wch: 20 }, // Receipt Code
        { wch: 18 }, // Applied Value
        { wch: 16 }, // Expired Day
    ];

    // Tinggi baris header
    ws['!rows'] = [{ hpt: 22 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Voucher Data');

    // ── Filename dengan Timestamp ──
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    XLSX.writeFile(wb, `${fileName}_${ts}.xlsx`);

    console.log(`[VoucherExport] ${data.length} baris diekspor → ${fileName}_${ts}.xlsx`);
};
