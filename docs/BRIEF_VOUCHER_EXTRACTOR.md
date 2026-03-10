# 💡 BRIEF: PDF Voucher Extractor

**Tanggal:** 2026-03-10
**Brainstorm dengan:** Yusuf Adi Pratama

---

## 1. MASALAH

File PDF Gift Voucher dari sistem internal berisi ratusan hingga **ribuan halaman** (1 halaman = 1 voucher). Mengambil data `Receipt Code` dan `Applied Value` dari setiap voucher secara manual sangat tidak efisien dan rawan kesalahan.

---

## 2. SOLUSI

Menambahkan menu baru **"Voucher Extractor"** di aplikasi Optimization Report. User cukup upload file PDF → aplikasi otomatis membaca semua halaman → mengekstrak `Receipt Code` dan `Applied Value` dari setiap voucher → menghasilkan file Excel yang siap digunakan.

---

## 3. TARGET USER

- **Utama:** Tim internal PT. Era Blu Elektronik yang mengelola data voucher customer
- **Sekunder:** Customer Service yang perlu verifikasi voucher

---

## 4. RISET PASAR

Tidak diperlukan (fitur internal, bukan produk komersial).

---

## 5. DETAIL TEKNIS

### Format PDF (Konsisten):
- Label: `Receipt Code: [VALUE]`
- Label: `Applied Value : [VALUE]` (ada spasi sebelum titik dua)
- 1 halaman = 1 voucher
- Skala: bisa mencapai ribuan halaman

### Output Excel:
| Receipt Code | Applied Value |
|-------------|---------------|
| 2F87AEBT    | 5,000,000     |
| ...         | ...           |

---

## 6. FITUR

### 🚀 MVP (Wajib Ada):
- [ ] Upload file PDF (satu file sekaligus)
- [ ] Progress bar saat proses ekstraksi (penting untuk file ribuan halaman)
- [ ] Tabel preview hasil ekstraksi sebelum export
- [ ] Export ke Excel (.xlsx) dengan 2 kolom: `Receipt Code` + `Applied Value`
- [ ] Tampilkan info: total voucher berhasil diekstrak

### 🎁 Phase 2 (Nanti):
- [ ] Upload multiple PDF sekaligus
- [ ] Filter hasil (misal: hanya tampilkan Applied Value tertentu)
- [ ] Kolom tambahan opsional (Customer, Expired Day, Seri Number)
- [ ] Export ke CSV selain Excel

### 💭 Backlog (Pertimbangan):
- [ ] Validasi duplikat Receipt Code

---

## 7. STACK TEKNIS

Aplikasi sudah menggunakan:
- **Frontend:** React + TypeScript + Vite
- **Runtime:** Electron (desktop app)
- **Excel Export:** `xlsx-js-style` (sudah ada di project!)

Library PDF yang akan ditambahkan:
- **`pdfjs-dist`** → Library resmi Mozilla untuk parse PDF di browser/Electron, akurat untuk PDF text-based (bukan scan/gambar)

---

## 8. ESTIMASI KOMPLEKSITAS

| Bagian | Level | Estimasi |
|--------|-------|----------|
| Install & setup `pdfjs-dist` | 🟢 Mudah | ~30 menit |
| Parse PDF + regex Receipt Code & Applied Value | 🟢 Mudah | ~1 jam |
| UI Upload + Progress bar | 🟡 Sedang | ~2 jam |
| Table preview + Export Excel | 🟢 Mudah | ~1 jam |
| **TOTAL** | 🟢 **Mudah** | **~4-5 jam** |

---

## 9. RISIKO

- ⚠️ **PDF di-scan (bukan text):** Jika PDF adalah hasil scan gambar, `pdfjs-dist` tidak bisa baca teks → perlu OCR (jauh lebih kompleks). Tapi dari contoh yang diberikan, format PDF sudah text-based, jadi aman.
- ⚠️ **Performa ribuan halaman:** Perlu parsing per-halaman secara async + progress bar agar UI tidak freeze.

---

## 10. LANGKAH BERIKUTNYA

→ Jalankan `/plan` untuk desain detail komponen dan struktur file
→ Lalu `/code` untuk implementasi fitur
