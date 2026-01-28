import React from 'react';
import { StaffMistakeResumeRow } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// @ts-ignore
import XLSX from 'xlsx-js-style';

interface StaffFifoMistakeTableProps {
    orders: StaffMistakeResumeRow[];
    dateRange?: { min: Date | null, max: Date | null } | null;
}

const StaffFifoMistakeTable: React.FC<StaffFifoMistakeTableProps> = ({ orders, dateRange }) => {
    const { t } = useLanguage();

    const handleDownload = () => {
        if (typeof XLSX === 'undefined') {
            alert('Library Excel sedang dimuat. Silakan coba lagi.');
            return;
        }

        try {
            const workbook = XLSX.utils.book_new();
            const border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
            const centerStyle = { alignment: { horizontal: "center", vertical: "center", wrapText: true } };
            const blueHeaderStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2F5597" } }, ...centerStyle, border: border };
            const yellowHeaderStyle = { font: { bold: true, color: { rgb: "FF0000" } }, fill: { fgColor: { rgb: "FFFF00" } }, ...centerStyle, border: border };
            const subHeadStyle = { font: { bold: true }, fill: { fgColor: { rgb: "D9D9D9" } }, ...centerStyle, border: border };

            // Title Logic: RESUME STAFF MISTAKE 1 - 20 JANUARI 2026
            let title = `RESUME STAFF MISTAKE ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}`;
            if (dateRange?.min && dateRange?.max) {
                const startDay = dateRange.min.getDate();
                const endDay = dateRange.max.getDate();
                const monthYear = dateRange.max.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
                // Check if same month/year for cleaner format
                if (dateRange.min.getMonth() === dateRange.max.getMonth() && dateRange.min.getFullYear() === dateRange.max.getFullYear()) {
                    title = `RESUME STAFF MISTAKE ${startDay} - ${endDay} ${monthYear}`;
                } else {
                    // Fallback for different months: 1 JANUARI - 5 FEBRUARI 2026
                    const startFull = dateRange.min.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }).toUpperCase();
                    title = `RESUME STAFF MISTAKE ${startFull} - ${endDay} ${monthYear}`;
                }
            }

            // Headers - Total and Status at the end
            const aoa: (string | number | null)[][] = [
                [title, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                ["NO", "AM", "Store Name", "Staff Name", "Phone", null, null, null, "Tablet", null, null, null, "TV", null, null, null, "Speaker", null, null, null, "Total", "Status"],
                [null, null, null, null, "Saleout at supermarket", "CO", "FULL EXCHANGE", "SO Return", "Saleout at supermarket", "CO", "FULL EXCHANGE", "SO Return", "Saleout at supermarket", "CO", "FULL EXCHANGE", "SO Return", "Saleout at supermarket", "CO", "FULL EXCHANGE", "SO Return", null, null]
            ];

            orders.forEach(row => {
                aoa.push([
                    row.no,
                    row.am,
                    row.storeName,
                    row.staffName,
                    row.phone.saleoutAtSupermarket, row.phone.co, row.phone.fullExchange, row.phone.soReturn,
                    row.tablet.saleoutAtSupermarket, row.tablet.co, row.tablet.fullExchange, row.tablet.soReturn,
                    row.tv.saleoutAtSupermarket, row.tv.co, row.tv.fullExchange, row.tv.soReturn,
                    row.speaker.saleoutAtSupermarket, row.speaker.co, row.speaker.fullExchange, row.speaker.soReturn,
                    row.total,
                    row.status
                ]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(aoa);

            // Merges
            worksheet['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 21 } }, // Title
                { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } }, // No
                { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } }, // AM
                { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, // Store Name
                { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // Staff Name

                { s: { r: 1, c: 4 }, e: { r: 1, c: 7 } }, // Phone
                { s: { r: 1, c: 8 }, e: { r: 1, c: 11 } }, // Tablet
                { s: { r: 1, c: 12 }, e: { r: 1, c: 15 } }, // TV
                { s: { r: 1, c: 16 }, e: { r: 1, c: 19 } }, // Speaker

                { s: { r: 1, c: 20 }, e: { r: 2, c: 20 } }, // Total
                { s: { r: 1, c: 21 }, e: { r: 2, c: 21 } }, // Status
            ];

            // Apply styles
            const setStyle = (addr: string, style: any) => { if (worksheet[addr]) worksheet[addr].s = style; };

            setStyle('A1', blueHeaderStyle);

            // Row 2 (Indices 1)
            // NO, AM, Store, Staff -> Blue
            for (let c = 0; c < 4; c++) setStyle(XLSX.utils.encode_cell({ r: 1, c }), blueHeaderStyle);
            // Phone, Tablet, TV, Speaker -> Yellow
            for (let c = 4; c < 20; c++) setStyle(XLSX.utils.encode_cell({ r: 1, c }), yellowHeaderStyle);
            // Total, Status -> Blue
            for (let c = 20; c < 22; c++) setStyle(XLSX.utils.encode_cell({ r: 1, c }), blueHeaderStyle);

            // Row 3 (Indices 2)
            // Subheaders -> Grey
            for (let c = 4; c < 20; c++) setStyle(XLSX.utils.encode_cell({ r: 2, c }), subHeadStyle);


            // Body styling
            const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1");
            for (let r = 3; r <= range.e.r; r++) {
                for (let c = 0; c <= 21; c++) {
                    const addr = XLSX.utils.encode_cell({ r, c });
                    if (!worksheet[addr]) worksheet[addr] = { t: 's', v: '' };
                    // CHANGED: wrapText set to false explicitly for body rows
                    let s: any = { border: border, alignment: { vertical: "center", wrapText: false } };

                    if (c === 0 || c === 1 || c === 3 || c === 20 || c === 21) {
                        // Center align for: No, AM, Staff Name, Total, Status
                        s.alignment.horizontal = "center";
                    } else if (c === 2) {
                        // Left align for Store Name
                        s.alignment.horizontal = "left";
                    } else {
                        // Numbers (Sales columns)
                        s.alignment.horizontal = "center";
                    }

                    if (c >= 4 && c <= 19) { // Sales data numbers
                        worksheet[addr].t = 'n';
                        s.numFmt = "#,##0";
                    }

                    if (c === 20) { // Total column
                        worksheet[addr].t = 'n';
                        s.font = { bold: true };
                        s.alignment.horizontal = "center";
                    }

                    if (c === 21) { // Status column
                        s.font = { color: { rgb: worksheet[addr].v === 'Urgent' ? "FF0000" : "000000" }, bold: worksheet[addr].v === 'Urgent' };
                        s.alignment.horizontal = "center";
                    }

                    worksheet[addr].s = s;
                }
            }

            worksheet['!cols'] = [
                { wch: 5 },  // NO
                { wch: 25 }, // AM - Increased width slightly since wrap is off
                { wch: 40 }, // Store Name - Increased width significantly since wrap is off
                { wch: 25 }, // Staff Name
                ...Array(16).fill({ wch: 10 }), // Sales Columns
                { wch: 8 },  // Total
                { wch: 10 }, // Status
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Mistakes");
            XLSX.writeFile(workbook, `Staff_FIFO_Mistake_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (err) {
            console.error(err);
            alert('Gagal mengekspor Excel.');
        }
    };

    return (
        <div className="w-full flex flex-col space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xs text-slate-500 font-medium">
                    {dateRange?.min && dateRange?.max ? (
                        <p>Periode Data: <span className="text-blue-600 font-bold">{dateRange.min.toLocaleDateString('id-ID')} - {dateRange.max.toLocaleDateString('id-ID')}</span></p>
                    ) : (
                        <p>Total Staf Terdeteksi: <span className="text-blue-600 font-bold">{orders.length}</span></p>
                    )}
                </div>
                <button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center space-x-2 transition-all shadow-sm hover:shadow-md disabled:bg-slate-300"
                    disabled={orders.length === 0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-sm">Unduh Excel</span>
                </button>
            </div>

            <div className="overflow-x-auto -mx-6">
                <div className="inline-block min-w-full py-2 align-middle px-6">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg border border-slate-200">
                        <table className="min-w-full border-collapse text-xs">
                            <thead>
                                <tr>
                                    <th rowSpan={2} className="p-2 text-center align-middle font-bold border border-slate-300 bg-[#2F5597] text-white">NO</th>
                                    <th rowSpan={2} className="p-2 text-center align-middle font-bold border border-slate-300 bg-[#2F5597] text-white">AM</th>
                                    <th rowSpan={2} className="p-2 text-center align-middle font-bold border border-slate-300 bg-[#2F5597] text-white">Store Name</th>
                                    <th rowSpan={2} className="p-2 text-center align-middle font-bold border border-slate-300 bg-[#2F5597] text-white">Staff Name</th>
                                    <th colSpan={4} className="p-2 text-center align-middle font-bold border border-slate-300 bg-yellow-400 text-red-600 uppercase">Phone</th>
                                    <th colSpan={4} className="p-2 text-center align-middle font-bold border border-slate-300 bg-yellow-400 text-red-600 uppercase">Tablet</th>
                                    <th colSpan={4} className="p-2 text-center align-middle font-bold border border-slate-300 bg-yellow-400 text-red-600 uppercase">TV</th>
                                    <th colSpan={4} className="p-2 text-center align-middle font-bold border border-slate-300 bg-yellow-400 text-red-600 uppercase">Speaker</th>
                                    <th rowSpan={2} className="p-2 text-center align-middle font-bold border border-slate-300 bg-[#2F5597] text-white">Total</th>
                                    <th rowSpan={2} className="p-2 text-center align-middle font-bold border border-slate-300 bg-[#2F5597] text-white">Status</th>
                                </tr>
                                <tr className="bg-slate-200 text-[9px]">
                                    {Array(4).fill(0).map((_, i) => (
                                        <React.Fragment key={i}>
                                            <th className="p-1 border border-slate-300 text-black">Saleout at supermarket</th>
                                            <th className="p-1 border border-slate-300 text-black">CO</th>
                                            <th className="p-1 border border-slate-300 text-black">FULL EXCHANGE</th>
                                            <th className="p-1 border border-slate-300 text-black">SO Return</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white text-black">
                                {orders.map((order) => (
                                    <tr key={order.no} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-2 text-center border border-slate-300">{order.no}</td>
                                        <td className="p-2 text-left border border-slate-300 whitespace-nowrap">{order.am}</td>
                                        <td className="p-2 text-left border border-slate-300 whitespace-nowrap">{order.storeName}</td>
                                        <td className="p-2 text-left border border-slate-300 whitespace-nowrap font-medium uppercase">{order.staffName}</td>

                                        <td className="p-1 text-center border border-slate-300">{order.phone.saleoutAtSupermarket || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.phone.co || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.phone.fullExchange || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.phone.soReturn || ''}</td>

                                        <td className="p-1 text-center border border-slate-300">{order.tablet.saleoutAtSupermarket || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.tablet.co || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.tablet.fullExchange || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.tablet.soReturn || ''}</td>

                                        <td className="p-1 text-center border border-slate-300">{order.tv.saleoutAtSupermarket || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.tv.co || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.tv.fullExchange || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.tv.soReturn || ''}</td>

                                        <td className="p-1 text-center border border-slate-300">{order.speaker.saleoutAtSupermarket || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.speaker.co || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.speaker.fullExchange || ''}</td>
                                        <td className="p-1 text-center border border-slate-300">{order.speaker.soReturn || ''}</td>

                                        <td className="p-2 text-center border border-slate-300 font-bold bg-slate-50 text-red-600">{order.total}</td>
                                        <td className={`p-2 text-center border border-slate-300 font-bold ${order.status === 'Urgent' ? 'text-red-600' : ''}`}>{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffFifoMistakeTable;
