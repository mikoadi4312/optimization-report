# Phase 01: Install Library PDF (pdfjs-dist)
Status: ⬜ Pending
Dependencies: Tidak ada

## Tujuan
Menginstall `pdfjs-dist` (library resmi Mozilla) yang dipakai untuk membaca teks dari file PDF tanpa butuh OCR.

## Kenapa pdfjs-dist?
- Akurat untuk PDF text-based (bukan scan gambar)
- Support browser & Electron
- Bisa parsing per-halaman → ideal untuk ribuan halaman

## Langkah Pengerjaan

1. [ ] Install package `pdfjs-dist`
   ```bash
   npm install pdfjs-dist
   ```

2. [ ] Pastikan versi yang terinstall kompatibel dengan Vite (versi 3.x atau 4.x)
   - Cek: `cat node_modules/pdfjs-dist/package.json | findstr version`

3. [ ] Konfigurasikan worker untuk pdfjs-dist di Vite
   - `pdfjs-dist` butuh file worker terpisah (`pdf.worker.mjs`)
   - Tambahkan config ke `vite.config.ts` untuk handle worker file

## Files yang Diedit
- `package.json` → tambah dependency (otomatis oleh npm install)
- `vite.config.ts` → tambah optimizeDeps / assetsInclude jika perlu

## Test Criteria
- [ ] `npm install pdfjs-dist` berhasil tanpa error
- [ ] Tidak ada TypeScript error terkait import pdfjs-dist
- [ ] `npm run dev` tetap berjalan normal

---
Tahap selanjutnya: [phase-02-pdf-parser.md](./phase-02-pdf-parser.md)
