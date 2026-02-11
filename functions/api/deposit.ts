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

            // Batch processing dengan transaksi
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

            const batch = transactions.map(tx => stmt.bind(
                tx.storeCode,
                tx.inOutVoucher,
                tx.customerName,
                tx.date ? new Date(tx.date).toISOString().split('T')[0] : null,
                tx.amount,
                tx.voucherType,
                tx.voucherReference,
                tx.content
            ));

            const results = await db.batch(batch);

            return new Response(JSON.stringify({ success: true, count: results.length }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response("Method not allowed", { status: 405, headers: corsHeaders });

    } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};
