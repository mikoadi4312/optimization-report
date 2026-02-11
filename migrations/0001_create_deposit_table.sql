-- Migration 0001: Create deposit_transactions table

DROP TABLE IF EXISTS deposit_transactions;

CREATE TABLE deposit_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_code TEXT,
    voucher_no TEXT UNIQUE,
    customer_name TEXT,
    date TEXT,
    amount REAL,
    type TEXT,
    reference TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voucher_no ON deposit_transactions(voucher_no);
