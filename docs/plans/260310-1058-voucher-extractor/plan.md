# Plan: Voucher Extractor (PDF → Excel)
Created: 2026-03-10 10:58
Status: 🟡 In Progress

## Overview
Fitur baru **Voucher Extractor** yang memungkinkan user meng-upload file PDF berisi Gift Voucher (ribuan halaman, 1 halaman = 1 voucher), lalu otomatis mengekstrak field `Receipt Code` dan `Applied Value` dari setiap halaman, dan mengekspornya ke file Excel (.xlsx) dengan:
- Header warna **biru tua** (`#1E3A5F`)
- Teks header warna **putih**, rata tengah
- **Garis tabel** di semua sel

## Referensi
- Brief: `docs/BRIEF_VOUCHER_EXTRACTOR.md`
- Gambar contoh PDF: 1 halaman berisi Gift Voucher PT. Era Blu Elektronik

## Tech Stack
- **Frontend:** React + TypeScript (sudah ada)
- **PDF Library:** `pdfjs-dist` (BARU - perlu install)
- **Excel Export:** `xlsx-js-style` (sudah ada di project)
- **Framework:** Vite + Electron

## Pola Regex (PENTING)
Berdasarkan contoh PDF:
```
Receipt Code:   2F87AEBT         → regex: /Receipt Code\s*:\s*([A-Z0-9]+)/i
Applied Value\s*:\s*([\d,]+)     → regex: /Applied Value\s*:\s*([\d,]+)/i
```

## Daftar Tahapan (Phases)

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Install Library PDF | ✅ Complete | 100% |
| 02 | Service: PDF Parser | ✅ Complete | 100% |
| 03 | Service: Excel Export | ✅ Complete | 100% |
| 04 | Komponen UI Voucher Extractor | ✅ Complete | 100% |
| 05 | Integrasi ke App (Sidebar + App.tsx) | ✅ Complete | 100% |

**Total:** ~35 tasks | Estimasi: 1-2 sesi kerja

## Perintah Cepat
- Mulai Phase 1: `/code phase-01`
- Cek progres: `/next`
- Simpan konteks: `/save-brain`
