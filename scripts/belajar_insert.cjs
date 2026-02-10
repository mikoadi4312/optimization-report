const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// 🔍 1. TENTUKAN LOKASI DATABASE
// Karena kita jalankan manual (bukan lewat Electron), kita harus tahu path absolut-nya.
// Di Windows biasanya: C:\Users\User\AppData\Roaming\<AppName>\optimization_report.db
// Sesuaikan <AppName> dengan 'name' di package.json atau folder yang terbentuk.
const dbPath = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), 'yusuf-adi-pratama---optimization-report-10', 'optimization_report.db');

console.log('📂 Target Database:', dbPath);

// 🔌 2. KONEKSI KE DATABASE
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Gagal connect:', err.message);
        console.log('👉 Pastikan aplikasi Electron sudah pernah dijalankan minimal sekali untuk membuat file DB.');
        process.exit(1);
    }
    console.log('✅ Berhasil terhubung ke SQLite.');
});

// 📝 3. SIAPKAN DATA DUMMY
const manualData = {
    store_code: '9000 - TOKO BELAJAR SQL',
    voucher_no: `TRAINING-${Date.now()}`, // Biar unik terus setiap run
    customer_name: 'Siswa Rajin',
    date: new Date().toISOString(), // Format ISO: 2026-02-10T...
    amount: 1500000,
    type: 'DEPOSIT',
    reference: 'LATIHAN-SQL-01',
    content: 'Ini data yang diinput manual lewat script Node.js'
};

// ⚙️ 4. SYNTAX SQL INSERT (INI INTINYA!)
// Gunakan tanda tanya (?) sebagai placeholder agar aman dari SQL Injection
const sql = `
    INSERT INTO deposit_transactions 
    (store_code, voucher_no, customer_name, date, amount, type, reference, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

const params = [
    manualData.store_code,
    manualData.voucher_no,
    manualData.customer_name,
    manualData.date,
    manualData.amount,
    manualData.type,
    manualData.reference,
    manualData.content
];

// ▶️ 5. EKSEKUSI QUERY
console.log('🚀 Sedang memasukkan data...');
db.run(sql, params, function (err) {
    if (err) {
        return console.error('❌ Error saat Insert:', err.message);
    }
    // 'this' di dalam callback function mengandung info hasil eksekusi
    console.log(`🎉 SUKSES! Data berhasil masuk.`);
    console.log(`🆔 ID Baris Baru: ${this.lastID}`);
    console.log(`📊 Jumlah Baris Berubah: ${this.changes}`);
});

// 🔒 6. TUTUP KONEKSI
db.close((err) => {
    if (err) console.error(err.message);
    console.log('🔌 Koneksi ditutup.');
});
