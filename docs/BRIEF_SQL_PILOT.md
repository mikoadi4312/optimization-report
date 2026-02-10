# 💡 BRIEF: SQL Pilot Project - Deposit Tools

**Tanggal:** 2026-02-06
**Brainstorm dengan:** Yusuf

---

## 1. MASALAH
Saat ini aplikasi bersifat "Stateless" (Tidak menyimpan data).
- User harus upload ulang file Excel setiap kali membuka aplikasi.
- Tidak bisa menumpuk data (history). Hanya bisa melihat data yang ada di Excel yang sedang di-upload.
- Jika ingin melihat tren bulan lalu, harus cari file Excel lama.

## 2. SOLUSI: Hybrid Architecture (SQL Pilot)
Mengimplementasikan **SQLite** (Database lokal) khusus untuk fitur **Deposit Tools** sebagai proyek percontohan.
- **Teknologi:** SQLite + Better-SQLite3 / Kysely (untuk Electron).
- **Strategi Import:** **Accumulate (Tumpuk)**. Data baru ditambahkan ke data lama.
- **Fitur Lain:** Tetap menggunakan cara lama (Excel-only) sementara waktu.

## 3. TARGET USER
- **Admin/User:** Yusuf (Data Entry)

## 4. FITUR BARU (Deposit Tools Only)

### 🚀 MVP (Wajib Ada):
- [ ] **Setup Database:** Inisialisasi file `.db` otomatis saat aplikasi dibuka.
- [ ] **Schema Table:** Tabel `deposit_transactions` (Store, Date, Amount, Type, dll).
- [ ] **Import Logic:**
    - Baca Excel upload-an user.
    - Cek duplikasi (agar data hari ini tidak dobel jika di-upload 2x).
    - Insert data baru ke SQLite.
- [ ] **Tampilan Report:** Ubah logic `DepositTools.tsx` agar membaca dari SQL, bukan langsung dari Excel.

### 🎁 Phase 2 (Nanti - Future):
- [ ] Fitur "Reset Data" (jika ingin hapus sejarah).
- [ ] Filter Tanggal (Start Date - End Date) yang lebih canggih karena data sudah terkumpul banyak.

## 5. ESTIMASI TEKNIS
- **Kompleksitas:** Sedang (🟡). Perlu setup layer database pertama kali di Electron.
- **Risiko:**
    - Konflik dengan Native Node Modules di Electron (biasa terjadi di Windows, tapi bisa diatasi).
    - Perubahan struktur data jika Excel berubah format.

## 6. LANGKAH BERIKUTNYA
→ Jalankan `/plan` untuk merancang detail skema database dan task coding.
