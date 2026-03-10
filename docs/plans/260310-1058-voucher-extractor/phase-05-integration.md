# Phase 05: Integrasi ke App (Sidebar + App.tsx + types.ts)
Status: ⬜ Pending
Dependencies: Phase 04 (komponen VoucherExtractor siap)

## Tujuan
Mendaftarkan fitur Voucher Extractor ke dalam aplikasi utama sehingga muncul di sidebar dan bisa diakses oleh user.

## Perubahan yang Diperlukan

### 1. `types.ts` — Tambah ReportType baru
```typescript
// SEBELUM:
export type ReportType = 'SO_NOT_EXPORT' | 'TRANSFER_GOODS' | 'DEPOSIT_TOOLS' | 'FIFO' | 'REVENUE_STAFF' | 'INCENTIVE_STAFF';

// SESUDAH:
export type ReportType = 'SO_NOT_EXPORT' | 'TRANSFER_GOODS' | 'DEPOSIT_TOOLS' | 'FIFO' | 'REVENUE_STAFF' | 'INCENTIVE_STAFF' | 'VOUCHER_EXTRACTOR';
```

### 2. `components/Sidebar.tsx` — Tambah menu item baru
```typescript
{
  type: 'VOUCHER_EXTRACTOR',
  label: 'Voucher Extractor',
  icon: <svg ...>  // icon dokumen PDF / tiket
}
```

### 3. `App.tsx` — Tampilkan komponen saat menu aktif
```typescript
// Import komponen baru
import VoucherExtractor from './components/reports/VoucherExtractor';

// Di dalam render, tambahkan kondisi:
{reportType === 'VOUCHER_EXTRACTOR' && (
  <VoucherExtractor />
)}
```

## Files yang Diedit
| File | Perubahan |
|------|-----------|
| `types.ts` | Tambah `'VOUCHER_EXTRACTOR'` ke union type `ReportType` |
| `components/Sidebar.tsx` | Tambah item menu "Voucher Extractor" dengan icon |
| `App.tsx` | Import + render `<VoucherExtractor />` |

## Detail: Icon untuk Sidebar
Gunakan icon voucher/tiket yang konsisten dengan style Heroicons lainnya:
```tsx
icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
</svg>
```

## Langkah Pengerjaan

1. [ ] Edit `types.ts`: tambah `'VOUCHER_EXTRACTOR'` ke `ReportType`
2. [ ] Edit `components/Sidebar.tsx`: tambah menu item baru
3. [ ] Edit `App.tsx`: import komponen + tampilkan saat menu aktif
4. [ ] Test navigasi: klik menu "Voucher Extractor" di sidebar → halaman muncul
5. [ ] Pastikan menu lain tidak terganggu (regression test)
6. [ ] Jalankan `npm run dev` dan verifikasi tidak ada TypeScript error

## Test Criteria
- [ ] Menu "Voucher Extractor" muncul di sidebar dengan icon
- [ ] Klik menu → halaman VoucherExtractor tampil
- [ ] Halaman lain tetap berfungsi normal
- [ ] Tidak ada error TypeScript saat build

---
🎉 **Fitur selesai!** Jalankan `npm run build` untuk cek production build.
