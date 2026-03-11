# Changelog

## [2026-03-10]
### Added
- **Voucher Extractor** (Fitur baru — menu ke-7 di sidebar):
    - Upload 1 atau banyak file PDF Gift Voucher sekaligus (drag & drop / klik)
    - Ekstrak otomatis 3 kolom: `Receipt Code`, `Applied Value`, `Expired Day`
    - Progress bar realtime per halaman, lintas semua file
    - Tabel preview hasil (tampilkan max 200 baris, export semua)
    - Export ke Excel: header biru tua (`#1E3A5F`), teks putih, border tabel, timestamp
    - Support ribuan halaman PDF per file, diproses sequential
    - Library: `pdfjs-dist`
    - Files: `services/reports/voucherExtractor.ts`, `services/reports/voucherExcelExport.ts`, `components/reports/VoucherExtractor.tsx`

### Fixed
- **Voucher Extractor — Receipt Code terpotong** (`XJAV` saja, harusnya `XJAV9PPV`):
    - Regex diperbarui agar tangkap multi-grup alfanumerik yang dipisah spasi, lalu strip spasi
- **Voucher Extractor — Kata "Seri number" ikut masuk ke Receipt Code** (`NT6997AASerinumber`):
    - Hapus flag `/i` dari regex sehingga `[A-Z0-9]` hanya cocok huruf kapital asli
- **Voucher Extractor — Huruf 'S' dari "Seri" masih ikut** (`U39NMQMAS` harusnya `U39NMQMA`):
    - Tambah negative lookahead `(?![a-z])` untuk batalkan grup jika huruf berikutnya lowercase

## [2026-02-11]
### Added
- **Cloudflare D1 Integration**: 
    - Implemented `functions/api/deposit.ts` to handle database operations via Cloudflare Workers.
    - Set up `optimization-db` on Cloudflare D1.
    - Added `npm run clouddb:dev` script for local development with cloud database.

### Fixed
- **Deposit Tools Table Display**: 
    - Resolved issue where table wasn't rendering in Electron by forcing a re-render with `key={orders.length}`.
    - Fixed "White Screen" issue in local cloud dev by correctly pointing Wrangler to `dist` folder.
- **Excel Header Detection**:
    - Restored and enhanced support for Indonesian headers (e.g., 'Jenis voucher', 'Nama pelanggan').

### Changed
- **Database Architecture**: 
    - Migrated from local SQLite (Electron-based) to Cloudflare D1 (Serverless) for Deposit Tools.
    - `App.tsx` now communicates via HTTP API (`/api/deposit`) instead of Electron IPC.

## [2026-02-02]
### Fixed
- **Deposit Tools Report Logic**: 
    - Implemented logic to support 'Voucher Concert' pairing.
    - Refunds referencing a specific Deposit via the 'Voucher concert' column now automatically exclude both the Refund and the original Deposit from the report (they cancel each other out).
    - Updated deduplication logic: if multiple transactions share the same Voucher ID, only the *latest* transaction (smallest checkDay) is kept, without modifying its date. This ensures accurate reporting of the most recent status.
