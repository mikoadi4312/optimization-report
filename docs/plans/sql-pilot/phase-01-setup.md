# Phase 01: Setup Environment
Status: ⬜ Pending

## Tujuan
Menyiapkan "mesin" database SQLite agar bisa berjalan di dalam Electron (Project Optimization Report).

## Langkah Pengerjaan
1. [ ] **Install Library**
   - Install `better-sqlite3` sebagai driver SQLite.
   - Install `@types/better-sqlite3` untuk TypeScript.
   - Pastikan build tool (`electron-rebuild` atau config Vite) aman untuk native module.

2. [ ] **Setup Database Manager**
   - Buat file `electron/database.ts` (atau lokasi yang sesuai di folder electron).
   - Buat fungsi `initDatabase()` untuk membuka/membuat file `.db` di folder User Data (`app.getPath('userData')`).
   - Pastikan tidak error saat aplikasi dijalankan (Dev & Production).

3. [ ] **Register di Main Process**
   - Panggil `initDatabase()` di `electron/main.cjs` (atau entry point main process) saat aplikasi start.

## File yang Dibuat
- `electron/database.ts`
- `electron/main.cjs` (Edit)

## Kriteria Tes
- [ ] Aplikasi bisa dijalankan (`npm run electron:dev`) tanpa crash.
- [ ] File `.db` (misal: `optimization_report.db`) muncul di folder `%APPDATA%` (Windows).
