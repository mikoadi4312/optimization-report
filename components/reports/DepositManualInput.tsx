import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DepositManualInput: React.FC<{ onDataSaved: () => void }> = ({ onDataSaved }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        store: '',
        inOutVoucher: '',
        customerName: '',
        date: new Date().toISOString().slice(0, 10),
        paymentAmount: '',
        type: 'DEPOSIT',
        voucherReference: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Basic Validation
        if (!formData.store || !formData.inOutVoucher || !formData.paymentAmount) {
            setMessage({ type: 'error', text: 'Store, Voucher No, and Amount are required.' });
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            paymentAmount: parseFloat(formData.paymentAmount) || 0,
            // Ensure date is ISO string if possible, input type="date" returns YYYY-MM-DD
        };

        try {
            const result = await window.electron.importDepositData([payload]);
            if (result.success) {
                setMessage({ type: 'success', text: `Data saved successfully! (${result.count} inserted/updated)` });
                // Reset form (optional, maybe keep store code for faster entry?)
                setFormData(prev => ({
                    ...prev,
                    inOutVoucher: '',
                    customerName: '',
                    paymentAmount: '',
                    voucherReference: '',
                    content: ''
                }));
                onDataSaved(); // Trigger refresh
            } else {
                setMessage({ type: 'error', text: result.error || 'Unknown error occurred' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to save data' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Manual Input Transaction
            </h3>

            {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Row 1 */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Store Code *</label>
                    <input
                        type="text"
                        name="store"
                        value={formData.store}
                        onChange={handleChange}
                        placeholder="e.g. 3088"
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Voucher No *</label>
                    <input
                        type="text"
                        name="inOutVoucher"
                        value={formData.inOutVoucher}
                        onChange={handleChange}
                        placeholder="e.g. IN23001..."
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tran Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    >
                        <option value="DEPOSIT">DEPOSIT (Masuk)</option>
                        <option value="REFUND">REFUND (Keluar)</option>
                    </select>
                </div>

                {/* Row 2 */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                    <input
                        type="number"
                        name="paymentAmount"
                        value={formData.paymentAmount}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                    <input
                        type="text"
                        name="voucherReference"
                        value={formData.voucherReference}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div className="md:col-span-1 lg:col-span-1">
                    {/* Spacer or Button if wanted inline */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Transaction'}
                    </button>
                </div>

                {/* Full width row for content */}
                <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content / Description</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

            </form>
        </div>
    );
};

export default DepositManualInput;
