# Phase 04: Frontend Integration
Status: ⬜ Pending

## Tujuan
Mengubah tampilan fitur Deposit Tools agar membaca dari Database, bukan dari Excel mentah.

## Langkah Pengerjaan
1. [ ] **Update Component Logic**
   - Edit `services/reports/depositTools.ts` (atau component terkait).
   - Saat halaman load (`useEffect`), panggil `window.electron.getDepositData()`.
   - Simpan ke State React.

2. [ ] **Update Upload Process**
   - Ubah fungsi handle upload Excel.
   - Setelah Excel di-parse -> JANGAN langsung set state.
   - Tapi kirim ke backend: `window.electron.importDepositData(parsedData)`.
   - Setelah sukses insert -> Refresh data (`getDepositData`).

3. [ ] **UI Adjustment**
   - Tambahkan tombol/indikator "Memuat data database..."
   - Tambahkan tombol "Reset Data" (Opsional, untuk dev).

## Kriteria Tes
- [ ] Buka menu Deposit Tools -> Data langsung muncul (kalau sudah ada).
- [ ] Upload Excel baru -> Data bertambah (Tumpuk/Accumulate).
