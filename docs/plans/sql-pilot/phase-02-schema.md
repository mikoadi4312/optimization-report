# Phase 02: Database Schema
Status: ⬜ Pending

## Tujuan
Membuat struktur tabel (Table Schema) untuk menyimpan data Deposit Tools.

## Langkah Pengerjaan
1. [ ] **Desain Schema**
   - Tabel: `deposit_transactions`
   - Kolom:
     - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
     - `store_code` (TEXT)
     - `voucher_no` (TEXT) - Masuk/Keluar Voucher
     - `customer_name` (TEXT)
     - `date` (TEXT/ISO8601) - Tanggal transaksi
     - `amount` (INTEGER) - Nilai uang
     - `type` (TEXT) - 'DEPOSIT' atau 'REFUND'
     - `reference` (TEXT) - Voucher Reference (jika ada)
     - `created_at` (TEXT) - Timestamp upload

2. [ ] **Implementasi Migration**
   - Tambahkan fungsi `createTables()` di `electron/database.ts`.
   - Jalankan fungsi ini setiap kali `initDatabase()` dipanggil (Check if not exists).

## Kriteria Tes
- [ ] Buka aplikasi, cek file database pake DB Browser for SQLite.
- [ ] Tabel `deposit_transactions` harus sudah ada dengan kolom yang benar.
