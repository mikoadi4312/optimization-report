# Phase 03: Service Excel Export
Status: ⬜ Pending
Dependencies: Phase 02 (VoucherRow interface tersedia)

## Tujuan
Membuat fungsi export Excel dari data `VoucherRow[]` dengan styling:
- **Header:** Background biru tua (`#1E3A5F`), teks putih (`#FFFFFF`), rata tengah
- **Garis tabel:** Semua sel (border tipis di semua sisi)
- **Lebar kolom:** Auto-fit atau fixed yang nyaman dibaca

## Spesifikasi Excel Output

### Tampilan yang diinginkan:
```
┌────────────────┬───────────────┐
│  Receipt Code  │ Applied Value │  ← Header: bg biru tua, teks putih, centered
├────────────────┼───────────────┤
│ 2F87AEBT       │ 5,000,000     │  ← Data: border tipis
│ A1B2C3D4       │ 2,500,000     │
└────────────────┴───────────────┘
```

### Style Config (xlsx-js-style):
```typescript
// Header style
const headerStyle = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
  fill: { fgColor: { rgb: '1E3A5F' } },  // biru tua
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top:    { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left:   { style: 'thin', color: { rgb: '000000' } },
    right:  { style: 'thin', color: { rgb: '000000' } },
  }
};

// Data cell style
const dataStyle = {
  alignment: { horizontal: 'left', vertical: 'center' },
  border: {
    top:    { style: 'thin', color: { rgb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
    left:   { style: 'thin', color: { rgb: 'CCCCCC' } },
    right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
  }
};
```

## Files yang Dibuat/Diedit
- `services/reports/voucherExcelExport.ts` → **BUAT BARU**

## Detail Implementasi: `voucherExcelExport.ts`

```typescript
import XLSX from 'xlsx-js-style';
import { VoucherRow } from '../../types';

export const exportVouchersToExcel = (
  data: VoucherRow[],
  fileName: string = 'Voucher_Extract'
): void => {
  const wb = XLSX.utils.book_new();

  // Header row
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
    fill: { fgColor: { rgb: '1E3A5F' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
    border: {
      top:    { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left:   { style: 'thin', color: { rgb: '000000' } },
      right:  { style: 'thin', color: { rgb: '000000' } },
    }
  };

  const dataBorderStyle = {
    top:    { style: 'thin', color: { rgb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
    left:   { style: 'thin', color: { rgb: 'CCCCCC' } },
    right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
  };

  // Build worksheet data
  const wsData: any[][] = [
    // Row 1: Headers
    [
      { v: 'Receipt Code', t: 's', s: headerStyle },
      { v: 'Applied Value', t: 's', s: headerStyle },
    ],
    // Rows 2+: Data
    ...data.map(row => [
      { v: row.receiptCode, t: 's', s: { alignment: { horizontal: 'left' }, border: dataBorderStyle } },
      { v: row.appliedValue, t: 's', s: { alignment: { horizontal: 'right' }, border: dataBorderStyle } },
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 },  // Receipt Code
    { wch: 18 },  // Applied Value
  ];

  // Set row height for header
  ws['!rows'] = [{ hpt: 22 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Voucher Data');

  // Generate filename dengan timestamp
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};
```

## Langkah Pengerjaan

1. [ ] Buat file `services/reports/voucherExcelExport.ts`
2. [ ] Implementasi fungsi `exportVouchersToExcel`
3. [ ] Verifikasi warna hex `#1E3A5F` sesuai biru tua yang diinginkan
4. [ ] Test export dengan data dummy:
   - Input: `[{ receiptCode: "2F87AEBT", appliedValue: "5,000,000" }]`
   - Expected: File Excel terbuka dengan header biru tua + border

## Test Criteria
- [ ] File Excel berhasil ter-download saat fungsi dipanggil
- [ ] Header Row 1: background biru tua `#1E3A5F`, teks putih, rata tengah
- [ ] Semua sel memiliki garis border (tidak terlihat plain)
- [ ] Kolom lebar cukup untuk membaca data tanpa terpotong

---
Tahap selanjutnya: [phase-04-ui-component.md](./phase-04-ui-component.md)
