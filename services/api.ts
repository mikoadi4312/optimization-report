/// <reference types="vite/client" />

// Helper untuk mendeteksi apakah kita di Dev (Localhost) atau Prod
const getApiUrl = (path: string) => {
    // Jika di localhost dan port vite/electron beda dengan wrangler/pages functions, sesuaikan.
    // Tapi biasanya relative path '/api/...' cukup jika dilayani domain yang sama.
    // Untuk dev environment React biasa tanpa wrangler proxy, mungkin perlu full URL.

    if (import.meta.env.DEV) {
        // Asumsi: Wrangler dev jalan di port 8788
        return `http://localhost:8788/api${path}`;
    }
    return `/api${path}`;
};


export interface ApiTransaction {
    storeCode: string;
    inOutVoucher: string;
    customerName: string;
    date: string | null;
    amount: number;
    voucherType: string;
    voucherReference: string;
    content: string;
}

export const apiService = {
    // Ambil data dari Cloudflare D1
    fetchDeposits: async (): Promise<any[]> => {
        try {
            const response = await fetch(getApiUrl('/deposit'));
            if (!response.ok) {
                // Try to read error body if possible
                const errText = await response.text().catch(() => response.statusText);
                throw new Error(`API Error: ${response.status} ${errText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch deposits:", error);
            throw error;
        }
    },

    // Kirim data Excel ke Cloudflare D1
    uploadDeposits: async (transactions: ApiTransaction[]): Promise<{ success: boolean, count: number }> => {
        const CHUNK_SIZE = 50; // Aman untuk sequential insert
        let totalSaved = 0;
        const errors: string[] = [];

        console.log(`🚀 Starting upload: ${transactions.length} rows in chunks of ${CHUNK_SIZE}...`);

        for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
            const chunk = transactions.slice(i, i + CHUNK_SIZE);
            // const isLast = i + CHUNK_SIZE >= transactions.length;

            try {
                console.log(`📤 Uploading chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(transactions.length / CHUNK_SIZE)}...`);

                const response = await fetch(getApiUrl('/deposit'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(chunk)
                });

                if (!response.ok) {
                    const errText = await response.text().catch(() => response.statusText);
                    throw new Error(`Server Error (${response.status}): ${errText}`);
                }

                const result = await response.json() as any;
                if (result.success && result.count) {
                    totalSaved += result.count;
                }
            } catch (error: any) {
                console.error(`❌ Chunk failed at index ${i}:`, error);
                errors.push(error.message);
                // Continue to try saving other chunks
            }
        }

        if (errors.length > 0) {
            console.error("⚠️ Upload completed with errors:", errors);
            if (totalSaved === 0) throw new Error("All chunks failed. Check server logs.");
        }

        return { success: true, count: totalSaved };
    }
};
