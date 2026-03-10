/**
 * VoucherExtractor.tsx
 * Komponen halaman Voucher Extractor dengan dukungan multi-file PDF.
 *
 * Fitur:
 * - Upload banyak PDF sekaligus (drag & drop atau klik)
 * - Progress bar global lintas semua file
 * - Tabel preview: Receipt Code | Applied Value | Expired Day
 * - Tombol Export Excel
 */

import React, { useState, useCallback, useRef } from 'react';
import { VoucherRow, ExtractionProgress } from '../../types';
import { extractVouchersFromMultiplePDFs } from '../../services/reports/voucherExtractor';
import { exportVouchersToExcel } from '../../services/reports/voucherExcelExport';

/** Progress diperluas untuk info multi-file */
interface MultiProgress extends ExtractionProgress {
    fileName: string;
    fileIndex: number;
    totalFiles: number;
}

const VoucherExtractor: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState<MultiProgress | null>(null);
    const [voucherData, setVoucherData] = useState<VoucherRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isExported, setIsExported] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── File Selection ────────────────────────────────────────────────────────

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const validFiles = Array.from(newFiles).filter(f =>
            f.name.toLowerCase().endsWith('.pdf')
        );
        const invalidCount = Array.from(newFiles).length - validFiles.length;

        if (invalidCount > 0) {
            setError(`${invalidCount} file diabaikan — hanya file PDF yang diterima.`);
        } else {
            setError(null);
        }

        if (validFiles.length === 0) return;

        setPdfFiles(prev => {
            // Hindari duplikat berdasarkan nama + ukuran
            const existingKeys = new Set(prev.map(f => `${f.name}_${f.size}`));
            const unique = validFiles.filter(f => !existingKeys.has(`${f.name}_${f.size}`));
            return [...prev, ...unique];
        });

        setVoucherData([]);
        setProgress(null);
        setIsExported(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(e.target.files);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        setPdfFiles(prev => prev.filter((_, i) => i !== index));
        setVoucherData([]);
        setIsExported(false);
    };

    // ── Extraction ────────────────────────────────────────────────────────────

    const handleExtract = useCallback(async () => {
        if (pdfFiles.length === 0) return;
        setIsExtracting(true);
        setError(null);
        setVoucherData([]);

        try {
            const results = await extractVouchersFromMultiplePDFs(pdfFiles, (prog) => {
                setProgress(prog as MultiProgress);
            });

            if (results.length === 0) {
                setError(
                    'Tidak ditemukan data di file PDF yang diupload. ' +
                    'Pastikan PDF bersifat text-based (bukan hasil scan gambar).'
                );
            } else {
                setVoucherData(results);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membaca PDF.');
        } finally {
            setIsExtracting(false);
        }
    }, [pdfFiles]);

    // ── Export ────────────────────────────────────────────────────────────────

    const handleExport = useCallback(() => {
        if (voucherData.length === 0) return;
        try {
            const baseName = pdfFiles.length === 1
                ? pdfFiles[0].name.replace(/\.pdf$/i, '')
                : 'Voucher_Extract';
            exportVouchersToExcel(voucherData, baseName);
            setIsExported(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengekspor ke Excel.');
        }
    }, [voucherData, pdfFiles]);

    // ── Reset ─────────────────────────────────────────────────────────────────

    const handleReset = () => {
        setPdfFiles([]);
        setVoucherData([]);
        setProgress(null);
        setError(null);
        setIsExported(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Total size helper ──────────────────────────────────────────────────────
    const totalSizeMB = (pdfFiles.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Voucher Extractor</h2>
                    <p className="text-sm text-slate-400">
                        Upload PDF Gift Voucher → Ekstrak <span className="text-blue-400">Receipt Code</span>,{' '}
                        <span className="text-blue-400">Applied Value</span>,{' '}
                        <span className="text-blue-400">Expired Day</span> → Export Excel
                    </p>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                id="voucher-upload-zone"
                onClick={() => !isExtracting && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 mb-4
          ${isExtracting
                        ? 'border-slate-700 bg-slate-800/30 cursor-not-allowed opacity-50'
                        : isDragging
                            ? 'border-blue-400 bg-blue-900/20 cursor-copy scale-[1.01]'
                            : 'border-slate-600 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800 cursor-pointer'
                    }
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple               // ← Support banyak file sekaligus!
                    className="hidden"
                    onChange={handleInputChange}
                    id="voucher-file-input"
                />

                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-300 font-medium mb-1">
                    {isDragging ? '✨ Lepaskan file di sini!' : 'Drop file PDF di sini, atau klik untuk pilih'}
                </p>
                <p className="text-xs text-slate-500">
                    Bisa pilih <span className="text-slate-400 font-semibold">banyak file sekaligus</span> — PDF text-based, bisa ribuan halaman per file
                </p>
            </div>

            {/* Daftar file terpilih */}
            {pdfFiles.length > 0 && (
                <div className="mb-4 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                        <span className="text-sm font-semibold text-slate-300">
                            📂 {pdfFiles.length} file PDF dipilih
                            <span className="ml-2 text-xs text-slate-500">({totalSizeMB} MB total)</span>
                        </span>
                        {!isExtracting && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Hapus semua
                            </button>
                        )}
                    </div>

                    <div className="divide-y divide-slate-700/50 max-h-48 overflow-y-auto">
                        {pdfFiles.map((file, idx) => (
                            <div key={`${file.name}_${idx}`} className="flex items-center gap-3 px-4 py-2.5">
                                {/* PDF icon */}
                                <div className="w-7 h-7 rounded bg-red-700/20 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[9px] font-bold text-red-400">PDF</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-200 truncate">{file.name}</p>
                                    <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>

                                <span className="text-[10px] text-slate-600 font-mono">#{idx + 1}</span>

                                {!isExtracting && (
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tombol Mulai Ekstraksi */}
            {pdfFiles.length > 0 && voucherData.length === 0 && !isExtracting && (
                <div className="flex justify-center mb-5">
                    <button
                        id="voucher-extract-btn"
                        onClick={handleExtract}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-900/40 transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Mulai Ekstraksi {pdfFiles.length > 1 ? `(${pdfFiles.length} file)` : ''}
                    </button>
                </div>
            )}

            {/* Progress Bar */}
            {isExtracting && progress && (
                <div className="mb-5 bg-slate-800 rounded-xl p-5 border border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-300 font-medium flex items-center gap-2">
                            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full" />
                            {progress.totalFiles > 1
                                ? `File ${progress.fileIndex}/${progress.totalFiles}: ${progress.fileName}`
                                : `Memproses halaman ${progress.currentPage.toLocaleString()} dari ${progress.totalPages.toLocaleString()}...`
                            }
                        </span>
                        <span className="text-sm font-bold text-blue-400">{progress.percentage}%</span>
                    </div>

                    {progress.totalFiles > 1 && (
                        <p className="text-xs text-slate-500 mb-2">
                            Halaman {progress.currentPage.toLocaleString()} dari {progress.totalPages.toLocaleString()} (semua file)
                        </p>
                    )}

                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-200"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-600 mt-2 text-center">
                        Jangan tutup aplikasi selama proses berlangsung...
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-5 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-400 mb-1">Perhatian</p>
                        <p className="text-xs text-red-300/80">{error}</p>
                    </div>
                </div>
            )}

            {/* Hasil Ekstraksi */}
            {voucherData.length > 0 && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {/* Toolbar hasil */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                        <div className="flex items-center gap-2 flex-wrap">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-slate-100">
                                {voucherData.length.toLocaleString()} voucher berhasil diekstrak
                            </span>
                            {pdfFiles.length > 1 && (
                                <span className="px-2 py-0.5 bg-blue-900/30 border border-blue-600/30 rounded text-xs text-blue-400">
                                    dari {pdfFiles.length} file PDF
                                </span>
                            )}
                            {isExported && (
                                <span className="px-2 py-0.5 bg-green-800/30 border border-green-600/30 rounded text-xs text-green-400">
                                    ✅ Sudah diekspor
                                </span>
                            )}
                        </div>

                        <button
                            id="voucher-export-btn"
                            onClick={handleExport}
                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-100 shadow-lg shadow-green-900/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Excel
                        </button>
                    </div>

                    {/* Tabel Preview */}
                    <div className="overflow-auto max-h-[420px]">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <th className="w-12 px-3 py-3 text-center text-xs font-bold text-slate-500 bg-slate-900 border-b border-slate-700">
                                        No
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white bg-[#1E3A5F] border-b border-slate-600 border-r border-slate-600">
                                        Receipt Code
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white bg-[#1E3A5F] border-b border-slate-600 border-r border-slate-600">
                                        Applied Value
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white bg-[#1E3A5F] border-b border-slate-600">
                                        Expired Day
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {voucherData.slice(0, 200).map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={`border-b border-slate-700/50 hover:bg-slate-700/40 transition-colors ${idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/60'
                                            }`}
                                    >
                                        <td className="px-3 py-2.5 text-center text-slate-600 text-xs border-r border-slate-700/40">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-slate-200 border-r border-slate-700/40">
                                            {row.receiptCode || <span className="text-slate-600 italic text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-slate-200 font-medium border-r border-slate-700/40">
                                            {row.appliedValue ? (
                                                <span className="font-mono">{row.appliedValue}</span>
                                            ) : (
                                                <span className="text-slate-600 italic text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-slate-300">
                                            {row.expiredDay || <span className="text-slate-600 italic text-xs">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Info overflow */}
                    {voucherData.length > 200 && (
                        <div className="px-5 py-3 border-t border-slate-700 bg-slate-900/30 text-center">
                            <p className="text-xs text-slate-500">
                                Menampilkan{' '}
                                <span className="text-slate-400 font-medium">200</span> dari{' '}
                                <span className="text-slate-400 font-medium">{voucherData.length.toLocaleString()}</span> baris.{' '}
                                Klik <strong className="text-green-400">Export Excel</strong> untuk melihat semua data.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VoucherExtractor;
