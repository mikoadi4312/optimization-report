# Phase 04: Komponen UI Voucher Extractor
Status: ⬜ Pending
Dependencies: Phase 02 + Phase 03

## Tujuan
Membuat komponen React `VoucherExtractor.tsx` yang menampilkan:
1. Area upload PDF
2. Progress bar realtime saat proses ekstraksi
3. Tabel preview hasil (Receipt Code + Applied Value)
4. Info total voucher diekstrak
5. Tombol Export Excel

## Layout UI

```
┌──────────────────────────────────────────────┐
│  🎟️  Voucher Extractor                        │
├──────────────────────────────────────────────┤
│                                              │
│   [ 📄 Drop PDF here or click to upload ]    │
│   Supports: PDF with multiple pages          │
│                                              │
├──────────────────────────────────────────────┤
│  ████████████████░░░░░░ 65%                  │  ← Progress bar
│  Processing page 650 of 1000...              │
├──────────────────────────────────────────────┤
│  ✅ 1000 vouchers extracted                  │
│                                              │
│  ┌──────────────┬──────────────┐             │
│  │ Receipt Code │ Applied Value│             │
│  ├──────────────┼──────────────┤             │
│  │ 2F87AEBT     │ 5,000,000   │             │
│  │ A1B2C3D4     │ 2,500,000   │             │
│  └──────────────┴──────────────┘             │
│                                              │
│         [ 📥 Export Excel ]                  │
└──────────────────────────────────────────────┘
```

## State Management Komponen

```typescript
const [pdfFile, setPdfFile] = useState<File | null>(null);
const [isExtracting, setIsExtracting] = useState(false);
const [progress, setProgress] = useState<ExtractionProgress | null>(null);
const [voucherData, setVoucherData] = useState<VoucherRow[]>([]);
const [error, setError] = useState<string | null>(null);
```

## Event Flow

```
User drag/drop PDF
       ↓
setPdfFile(file)
       ↓
Klik Tombol "Ekstrak"
       ↓
setIsExtracting(true)
       ↓
extractVouchersFromPDF(file, onProgress)
                 ↓ (per halaman)
         setProgress({ currentPage, totalPages, percentage })
                 ↓ (selesai)
setVoucherData(results)
setIsExtracting(false)
       ↓
Tampil tabel preview
       ↓
Klik tombol "Export Excel"
       ↓
exportVouchersToExcel(voucherData)
```

## Files yang Dibuat/Diedit
- `components/reports/VoucherExtractor.tsx` → **BUAT BARU**

## Langkah Pengerjaan

1. [ ] Buat struktur dasar komponen dengan state management
2. [ ] Implementasi drag & drop file input (bisa pakai pola dari `FileUpload.tsx` yang sudah ada)
3. [ ] Tambahkan progress bar dengan animasi smooth
4. [ ] Buat tabel preview hasil ekstraksi (pakai styling yang konsisten dengan app)
5. [ ] Tambahkan bagian info: "✅ X voucher berhasil diekstrak"
6. [ ] Tambahkan tombol "Export Excel" yang trigger `exportVouchersToExcel`
7. [ ] Handle error state: tampilkan pesan jika PDF tidak bisa dibaca
8. [ ] Handle kasus tabel kosong (tidak ada Receipt Code/Applied Value ditemukan)

## Test Criteria
- [ ] User bisa upload PDF melalui drag & drop atau klik
- [ ] Progress bar muncul dan bergerak saat proses berjalan
- [ ] Setelah selesai, tabel menampilkan data yang diekstrak
- [ ] Tombol Export Excel ter-disable saat tidak ada data
- [ ] Error ditampilkan dengan jelas jika PDF tidak bisa dibaca

---
Tahap selanjutnya: [phase-05-integration.md](./phase-05-integration.md)
