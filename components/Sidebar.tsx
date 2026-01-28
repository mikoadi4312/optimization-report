import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ReportType } from '../types';

interface SidebarProps {
    activeReport: ReportType;
    onSelectReport: (type: ReportType) => void;
    isLimitedView?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeReport, onSelectReport, isLimitedView = false }) => {
    const { t } = useLanguage();

    const menuItems: { type: ReportType; label: string; icon: React.ReactNode }[] = [
        {
            type: 'SO_NOT_EXPORT',
            label: t('app.buttons.soNotExport'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        },
        {
            type: 'FIFO',
            label: t('app.buttons.fifo'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        },
        {
            type: 'TRANSFER_GOODS',
            label: t('app.buttons.transferGoods'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        },
        {
            type: 'DEPOSIT_TOOLS',
            label: t('app.buttons.depositTools'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        },
        {
            type: 'REVENUE_STAFF',
            label: t('app.buttons.revenueStaff'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            type: 'INCENTIVE_STAFF',
            label: t('app.buttons.incentiveStaff'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
    ];

    return (
        <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-10 shadow-xl">
            <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
                <h1 className="text-lg font-bold tracking-wide">
                    {isLimitedView ? 'ERABLUE Report' : 'Yusuf Adi Pratama'}
                </h1>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.type}
                        onClick={() => onSelectReport(item.type)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeReport === item.type
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className={`${activeReport === item.type ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                            {item.icon}
                        </span>
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">
                    {isLimitedView
                        ? (menuItems.find(item => item.type === activeReport)?.label || 'Report')
                        : <>&copy; 2025 Optimization Report<br /><span className="text-[10px] text-emerald-400">v1.2 (Green Header)</span></>
                    }
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
