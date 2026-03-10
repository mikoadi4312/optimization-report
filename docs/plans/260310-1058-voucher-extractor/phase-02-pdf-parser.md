# Phase 02: Service PDF Parser
Status: ⬜ Pending
Dependencies: Phase 01 (pdfjs-dist terinstall)

## Tujuan
Membuat service TypeScript yang menerima file PDF dan mengekstrak `Receipt Code` & `Applied Value` dari setiap halaman.

## Logika Ekstraksi

### Regex Pattern (dari contoh PDF):
```
Receipt Code: 2F87AEBT
Applied Value : 5,000,000
```

```typescript
// Receipt Code: huruf kapital + angka, setelah label "Receipt Code:"
const receiptCodeRegex = /Receipt\s+Code\s*:\s*([A-Z0-9]+)/i;

// Applied Value: angka dengan koma pemisah ribuan, setelah label "Applied Value :"
const appliedValueRegex = /Applied\s+Value\s*:\s*([\d,]+)/i;
```

### Alur Kerja Service:
```
PDF File Input
     ↓
pdfjs: getDocument(file)
     ↓
Loop per halaman (page 1 → N)
     ↓
page.getTextContent()
     ↓
Gabungkan semua text item jadi string
     ↓
Jalankan regex → dapat Receipt Code & Applied Value
     ↓
Push ke array result
     ↓
Return: VoucherRow[] + progress callback
```

## Interface Data

```typescript
// Tambahkan ke types.ts
export interface VoucherRow {
  receiptCode: string;
  appliedValue: string;  // simpan as string untuk preserve format "5,000,000"
}
```

## Files yang Dibuat/Diedit

- `services/reports/voucherExtractor.ts` → **BUAT BARU** (logic utama)
- `types.ts` → tambah interface `VoucherRow`

## Detail Implementasi: `voucherExtractor.ts`

```typescript
import * as pdfjsLib from 'pdfjs-dist';

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export interface VoucherRow {
  receiptCode: string;
  appliedValue: string;
}

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
}

export const extractVouchersFromPDF = async (
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<VoucherRow[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const results: VoucherRow[] = [];

  const receiptCodeRegex = /Receipt\s+Code\s*:\s*([A-Z0-9]+)/i;
  const appliedValueRegex = /Applied\s+Value\s*:\s*([\d,]+)/i;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Gabungkan semua text item jadi satu string
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    const receiptMatch = pageText.match(receiptCodeRegex);
    const appliedMatch = pageText.match(appliedValueRegex);

    if (receiptMatch || appliedMatch) {
      results.push({
        receiptCode: receiptMatch ? receiptMatch[1].trim() : '',
        appliedValue: appliedMatch ? appliedMatch[1].trim() : '',
      });
    }

    // Emit progress setiap halaman
    onProgress?.({
      currentPage: pageNum,
      totalPages,
      percentage: Math.round((pageNum / totalPages) * 100),
    });
  }

  return results;
};
```

## Langkah Pengerjaan

1. [ ] Tambah interface `VoucherRow` ke `types.ts`
2. [ ] Buat file `services/reports/voucherExtractor.ts`
3. [ ] Implementasi fungsi `extractVouchersFromPDF` dengan progress callback
4. [ ] Test regex dengan contoh teks dari PDF:
   - Input: `"Receipt Code: 2F87AEBT"`
   - Expected output: `{ receiptCode: "2F87AEBT", appliedValue: "5,000,000" }`

## Test Criteria
- [ ] Regex berhasil menangkap `Receipt Code` dari string contoh
- [ ] Regex berhasil menangkap `Applied Value` dari string contoh
- [ ] Progress callback dipanggil setiap halaman selesai diproses
- [ ] Untuk halaman tanpa data, tidak melempar error (graceful handling)

---
Tahap selanjutnya: [phase-03-excel-export.md](./phase-03-excel-export.md)
