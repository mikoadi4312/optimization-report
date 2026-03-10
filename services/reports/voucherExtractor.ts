/**
 * voucherExtractor.ts
 * Service untuk mengekstrak Receipt Code, Applied Value, dan Expired Day dari PDF Gift Voucher.
 * Mendukung pemrosesan multi-file sekaligus.
 *
 * Format PDF yang didukung:
 *   Receipt Code: 2F87AEBT
 *   Applied Value : 5,000,000
 *   Expired Day: 02/05/2026
 */

import * as pdfjsLib from 'pdfjs-dist';
import { VoucherRow, ExtractionProgress } from '../../types';

// Konfigurasi worker pdfjs — wajib untuk bisa membaca PDF
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

// --- Regex Patterns ---
// Receipt Code: TANPA flag /i + negative lookahead (?![a-z])
// (?![a-z]) artinya: batalkan grup ini jika huruf SETELAHNYA adalah huruf kecil.
// Kasus "U39NMQMA Seri" → "S" diikuti "e" (kecil) → BATAL → hasil: "U39NMQMA" ✅
// Kasus "XJAV 9PPV Seri" → "9PPV" diikuti " " (bukan kecil) → OK, "S" diikuti "e" → BATAL
//   → hasil: "XJAV 9PPV" → strip spasi → "XJAV9PPV" ✅
const RECEIPT_CODE_REGEX = /Receipt\s+Code\s*:\s*([A-Z0-9]+(?:\s+[A-Z0-9]+(?![a-z]))*)/;
// Applied Value: angka dengan koma pemisah ribuan
const APPLIED_VALUE_REGEX = /Applied\s+Value\s*:\s*([\d,]+)/i;
// Expired Day: tanggal dalam format DD/MM/YYYY atau MM/DD/YYYY
const EXPIRED_DAY_REGEX = /Expired\s+Day\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;

// ── Single-file extraction ───────────────────────────────────────────────────

/**
 * Mengekstrak data voucher dari SATU file PDF.
 *
 * @param file         File PDF yang di-upload user
 * @param onProgress   Callback progress per halaman (opsional)
 * @param pageOffset   Offset halaman untuk progress multi-file (opsional)
 * @param totalGlobal  Total halaman global untuk progress multi-file (opsional)
 */
export const extractVouchersFromPDF = async (
    file: File,
    onProgress?: (progress: ExtractionProgress) => void,
    pageOffset: number = 0,
    totalGlobal: number = 0
): Promise<VoucherRow[]> => {
    let pdf: pdfjsLib.PDFDocumentProxy | null = null;

    try {
        const arrayBuffer = await file.arrayBuffer();
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const filePages = pdf.numPages;
        const totalPages = totalGlobal > 0 ? totalGlobal : filePages;
        const results: VoucherRow[] = [];

        for (let pageNum = 1; pageNum <= filePages; pageNum++) {
            try {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                // Gabungkan semua item teks menjadi satu string per halaman
                const pageText = textContent.items
                    .map((item: any) => item.str || '')
                    .join(' ');

                const receiptMatch = pageText.match(RECEIPT_CODE_REGEX);
                const appliedMatch = pageText.match(APPLIED_VALUE_REGEX);
                const expiredMatch = pageText.match(EXPIRED_DAY_REGEX);

                // Tambahkan ke hasil hanya jika minimal satu field ditemukan
                if (receiptMatch || appliedMatch || expiredMatch) {
                    // Hapus semua spasi dari Receipt Code:
                    // PDF kadang memenggal kode menjadi beberapa bagian (misal "XJAV 9PPV" → "XJAV9PPV")
                    const rawReceiptCode = receiptMatch ? receiptMatch[1].trim() : '';
                    results.push({
                        receiptCode: rawReceiptCode.replace(/\s+/g, ''),
                        appliedValue: appliedMatch ? appliedMatch[1].trim() : '',
                        expiredDay: expiredMatch ? expiredMatch[1].trim() : '',
                    });
                }

                // Cleanup page untuk hemat memori (penting untuk ribuan halaman)
                page.cleanup();
            } catch (pageError) {
                console.warn(`[VoucherExtractor] Error on page ${pageNum} of "${file.name}":`, pageError);
            }

            // Emit progress — gunakan offset untuk perhitungan global multi-file
            onProgress?.({
                currentPage: pageOffset + pageNum,
                totalPages,
                percentage: Math.round(((pageOffset + pageNum) / totalPages) * 100),
            });
        }

        return results;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal membaca file PDF.';
        throw new Error(`[${file.name}] PDF Error: ${message}`);
    } finally {
        if (pdf) pdf.destroy();
    }
};

// ── Multi-file extraction ────────────────────────────────────────────────────

/**
 * Mengekstrak data voucher dari BANYAK file PDF sekaligus.
 * File diproses secara berurutan (sequential), bukan paralel,
 * untuk menghindari kehabisan memori saat file berukuran besar.
 *
 * @param files       Array file PDF
 * @param onProgress  Callback progress global (lintas semua file)
 * @returns           Semua VoucherRow dari semua file, sudah digabung
 */
export const extractVouchersFromMultiplePDFs = async (
    files: File[],
    onProgress?: (progress: ExtractionProgress & { fileName: string; fileIndex: number; totalFiles: number }) => void
): Promise<VoucherRow[]> => {
    // Hitung total halaman terlebih dahulu untuk progress bar yang akurat
    let totalPages = 0;
    const pageCounts: number[] = [];

    for (const file of files) {
        try {
            const ab = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
            pageCounts.push(pdf.numPages);
            totalPages += pdf.numPages;
            pdf.destroy();
        } catch {
            pageCounts.push(0); // File rusak/tidak bisa dibaca, skip
        }
    }

    const allResults: VoucherRow[] = [];
    let pageOffset = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            const results = await extractVouchersFromPDF(
                file,
                (prog) => {
                    onProgress?.({
                        ...prog,
                        totalPages,
                        currentPage: pageOffset + prog.currentPage,
                        percentage: Math.round(((pageOffset + prog.currentPage) / totalPages) * 100),
                        fileName: file.name,
                        fileIndex: i + 1,
                        totalFiles: files.length,
                    });
                },
                pageOffset,
                totalPages
            );

            allResults.push(...results);
        } catch (err) {
            // Lanjutkan file berikutnya meskipun satu file gagal
            console.error(`[VoucherExtractor] Skipping "${file.name}":`, err);
        }

        pageOffset += pageCounts[i] || 0;
    }

    return allResults;
};
