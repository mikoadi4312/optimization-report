/* eslint-disable no-console */

// Tipe data yang dikirim dari Frontend (sama dengan sebelumnya)
interface Transaction {
    storeCode: string;
    inOutVoucher: string;
    customerName: string;
    date: Date | null;
    amount: number;
    voucherType: string;
    voucherReference: string;
    content: string;
}

// Handler untuk POST (Simpan Data) dan GET (Ambil Data)
export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
    console.log(`[API] Incoming ${context.request.method} request to ${context.request.url}`);

    // 1. CORS Headers (Agar bisa diakses dari localhost maupun domain asli)
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // 2. Handle OPTIONS (Preflight Request untuk Browser)
    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const db = context.env.DB; // Binding ke D1 Database

        if (!db) {
            console.error("❌ CRITICAL: Database binding 'DB' is undefined.");
            throw new Error("Database configuration error: Binding 'DB' not found.");
        }

        // --- SAFEGUARD: Auto-Create Table if not exists ---
        // Replacing db.exec with db.prepare().run() avoids the "undefined reading 'duration'" error in local Wrangler
        try {
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS deposit_transactions (
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
                )
            `).run();

            await db.prepare(`
                CREATE INDEX IF NOT EXISTS idx_voucher_no ON deposit_transactions(voucher_no)
            `).run();

            console.log("[API] Database schema verified.");
        } catch (tableErr) {
            console.warn("⚠️ Schema setup warning (safe to ignore if table exists):", tableErr);
        }

        // 3. Handle GET (Ambil Data dari Database)
        if (context.request.method === "GET") {
            const result = await db.prepare("SELECT * FROM deposit_transactions ORDER BY date DESC LIMIT 5000").all();
            return new Response(JSON.stringify(result.results), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 4. Handle POST (Simpan Data ke Database)
        if (context.request.method === "POST") {
            const transactions = await context.request.json() as Transaction[];

            if (!Array.isArray(transactions) || transactions.length === 0) {
                return new Response(JSON.stringify({ success: false, error: "No data provided" }), {
                    status: 400, headers: corsHeaders
                });
            }

            console.log(`📝 Processing POST: ${transactions.length} items`);

            const stmt = db.prepare(`
                INSERT INTO deposit_transactions (store_code, voucher_no, customer_name, date, amount, type, reference, content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(voucher_no) DO UPDATE SET
                    store_code=excluded.store_code,
                    customer_name=excluded.customer_name,
                    date=excluded.date,
                    amount=excluded.amount,
                    type=excluded.type,
                    content=excluded.content
            `);

            let successCount = 0;
            const errors: any[] = [];

            // Process sequentially to identify specific issues and avoid batch limits
            for (const [index, tx] of transactions.entries()) {
                try {
                    // Validate/Format Date
                    let dateStr = null;
                    if (tx.date) {
                        const d = new Date(tx.date);
                        if (!isNaN(d.getTime())) {
                            dateStr = d.toISOString().split('T')[0];
                        }
                    }

                    await stmt.bind(
                        tx.storeCode || null,
                        tx.inOutVoucher,
                        tx.customerName || null,
                        dateStr,
                        tx.amount || 0,
                        tx.voucherType || null,
                        tx.voucherReference || null,
                        tx.content || null
                    ).run();

                    successCount++;
                } catch (rowErr: any) {
                    console.error(`❌ Error inserting row ${index} (${tx.inOutVoucher}):`, rowErr);
                    errors.push({ row: index, voucher: tx.inOutVoucher, error: rowErr.message });
                }
            }

            if (errors.length > 0) {
                console.error("⚠️ Some rows failed to insert:", errors);
                // We still return success: false if ANY failed, or we can return partial success.
                // For now, let's return 500 if mostly failed, or include errors in debug.
                if (successCount === 0) {
                    return new Response(JSON.stringify({ success: false, error: "All rows failed", details: errors }), {
                        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
                    });
                }
            }

            return new Response(JSON.stringify({ success: true, count: successCount, errors: errors.length > 0 ? errors : undefined }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response("Method not allowed", { status: 405, headers: corsHeaders });

    } catch (err: any) {
        console.error("🔥 FATAL API ERROR:", err);
        console.error(err.stack); // Print stack trace
        return new Response(JSON.stringify({ success: false, error: err.message, stack: err.stack }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};
