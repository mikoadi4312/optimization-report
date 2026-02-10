# Phase 03: Backend Logic (CRUD)
Status: ⬜ Pending

## Tujuan
Membuat "Otak" yang menghubungkan Excel, Database, dan Frontend lewat IPC (Inter-Process Communication).

## Langkah Pengerjaan
1. [ ] **IPC Handler: GET Data**
   - Buat handler `db:get-deposit-data`.
   - Logic: `SELECT * FROM deposit_transactions ORDER BY date DESC`.
   - Return array object ke frontend.

2. [ ] **IPC Handler: IMPORT Data**
   - Buat handler `db:import-deposit`.
   - Logic:
     - Terima Array data (hasil parsing Excel dari Frontend).
     - Loop data dan INSERT ke tabel `deposit_transactions`.
     - (Opsional) Cek duplikat sederhana berdasarkan `voucher_no` agar tidak dobel.

3. [ ] **Type Definition**
   - Update `preload.ts` (atau `electron/preload.ts`) untuk mengekspos fungsi baru ke `window.electron`.
   - Update `types.ts` di frontend.

## Kriteria Tes
- [ ] Bisa memanggil `window.electron.getDepositData()` dari console browser (return array kosong).
- [ ] Bisa memanggil `window.electron.importDepositData(...)` dan data tersimpan.
