// Script untuk generate file Excel test Deposit Manual
import XLSX from 'xlsx-js-style';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- File 1: Data AM (peta toko ke AM) ---
const amData = [
    ['Kode Toko', 'Nama Toko', 'AM', 'Kota'],
    ['TK001', 'Toko Samsung Plaza', 'Budi Santoso', 'Jakarta'],
    ['TK002', 'Toko Samsung Mall', 'Agus Wijaya', 'Bandung'],
    ['TK003', 'Toko Samsung City', 'Budi Santoso', 'Jakarta'],
];

const wbAM = XLSX.utils.book_new();
const wsAM = XLSX.utils.aoa_to_sheet(amData);
XLSX.utils.book_append_sheet(wbAM, wsAM, 'AM Data');
const amPath = join(__dirname, '..', 'test_data_am.xlsx');
XLSX.writeFile(wbAM, amPath);
console.log('✅ File Data AM dibuat:', amPath);

// --- File 2: Deposit Manual ---
const depositHeaders = [
    'Kode toko', 'No. IN/OUT voucher', 'Nama pelanggan', 'Tanggal',
    'Jumlah', 'Jenis voucher', 'No. voucher referensi', 'Konten'
];

const depositRows = [
    ['TK001', 'INV-2026-001', 'Ahmad Fauzi', '2026-02-01', 500000, 'Voucher Deposit', '', 'Deposit TV Samsung'],
    ['TK001', 'INV-2026-002', 'Siti Rahayu', '2026-02-03', 750000, 'Voucher Deposit', '', 'Deposit HP Samsung'],
    ['TK002', 'INV-2026-003', 'Budi Setiawan', '2026-02-05', 1200000, 'Voucher Deposit', '', 'Deposit Tablet'],
    ['TK002', 'INV-2026-004', 'Dewi Maharani', '2026-02-10', 300000, 'Voucher Refund', 'INV-2026-003', 'Refund Tablet'],
    ['TK003', 'INV-2026-005', 'Rudi Hartono', '2026-02-12', 600000, 'Voucher Deposit', '', 'Deposit Speaker'],
    ['TK001', 'INV-2026-006', 'Ani Kusuma', '2026-02-14', 900000, 'Voucher Deposit', '', 'Deposit HP Galaxy'],
    ['TK003', 'INV-2026-007', 'Hendra Gunawan', '2026-02-15', 450000, 'Voucher Deposit', '', 'Deposit TV QLED'],
];

const wbDeposit = XLSX.utils.book_new();
const wsDeposit = XLSX.utils.aoa_to_sheet([depositHeaders, ...depositRows]);
XLSX.utils.book_append_sheet(wbDeposit, wsDeposit, 'Deposit');
const depositPath = join(__dirname, '..', 'test_deposit_manual.xlsx');
XLSX.writeFile(wbDeposit, depositPath);
console.log('✅ File Deposit Manual dibuat:', depositPath);

console.log('\n📋 Ringkasan:');
console.log(`   - ${depositRows.length} transaksi deposit test`);
console.log(`   - 3 toko (TK001, TK002, TK003)`);
console.log(`   - Termasuk 1 refund untuk test deduplication`);
console.log('\nSiap di-upload ke website!');
