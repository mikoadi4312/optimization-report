import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-red-50 p-6">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full border border-red-200">
                        <div className="flex items-center gap-4 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h1 className="text-2xl font-bold text-red-600">Aplikasi Mengalami Error</h1>
                                <p className="text-slate-600">Terjadi kesalahan saat memproses data</p>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <h2 className="font-semibold text-red-700 mb-2">Detail Error:</h2>
                            <p className="text-sm text-red-600 font-mono break-all">
                                {this.state.error?.message || 'Unknown error'}
                            </p>
                        </div>

                        <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 mb-6">
                            <h2 className="font-semibold text-slate-700 mb-2">Kemungkinan Penyebab:</h2>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                <li><strong>File terlalu besar</strong> - Data Excel melebihi kapasitas memori browser</li>
                                <li><strong>Format file salah</strong> - Kolom atau struktur data tidak sesuai</li>
                                <li><strong>Memori browser penuh</strong> - Terlalu banyak tab atau aplikasi terbuka</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h2 className="font-semibold text-blue-700 mb-2">Solusi:</h2>
                            <ol className="list-decimal list-inside text-sm text-blue-600 space-y-1">
                                <li>Coba gunakan file dengan jumlah baris lebih sedikit (maksimal 50,000 baris)</li>
                                <li>Tutup tab browser lain untuk membebaskan memori</li>
                                <li>Restart aplikasi dengan menekan tombol di bawah</li>
                            </ol>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Restart Aplikasi
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
