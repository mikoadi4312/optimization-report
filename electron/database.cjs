const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

let db = null;

function initDatabase() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'optimization_report.db');

    console.log('📦 Database Path:', dbPath);

    // Open database
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Failed to connect to database:', err.message);
        } else {
            console.log('✅ Connected to SQLite database (sqlite3).');
            createTables();
        }
    });

    return db;
}

function createTables() {
    if (!db) return;

    const createDepositTable = `
    CREATE TABLE IF NOT EXISTS deposit_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_code TEXT,
      voucher_no TEXT,
      customer_name TEXT,
      date TEXT,
      amount INTEGER,
      type TEXT,
      reference TEXT,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

    db.run(createDepositTable, (err) => {
        if (err) {
            console.error('❌ Error creating table:', err.message);
        } else {
            console.log('✅ Table "deposit_transactions" ready.');

            // MIGRATION: Attempt to add 'content' column for existing databases
            // This will fail silently if column exists (we catch the error)
            const migrateContent = "ALTER TABLE deposit_transactions ADD COLUMN content TEXT";
            db.run(migrateContent, (migErr) => {
                if (!migErr) {
                    console.log('✅ Migration: Added "content" column.');
                }
                // If error, it likely means column exists. Ignore.
            });
        }
    });
}

// Helper wrapper untuk query (Promise-based) supaya mirip better-sqlite3 vibe
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function runExecute(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

module.exports = {
    initDatabase,
    runQuery,
    runExecute
};
