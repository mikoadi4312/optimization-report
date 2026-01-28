import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
    headerClassName?: string;
    width?: number;
}

interface VirtualTableProps<T> {
    data: T[];
    columns: Column<T>[];
    className?: string;
    estimateSize?: number;
    overscan?: number;
    customHeader?: React.ReactNode;
}

function VirtualTable<T extends Record<string, any>>({
    data = [],
    columns,
    className = '',
    estimateSize = 50,
    overscan = 10,
    customHeader,
}: VirtualTableProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: data?.length || 0,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan,
    });

    const getCellValue = (row: T, column: Column<T>) => {
        let value;
        if (typeof column.accessor === 'function') {
            value = column.accessor(row);
        } else {
            value = row[column.accessor];
        }
        // Convert null, undefined, or NaN to empty string to prevent "null" text display
        if (value == null || (typeof value === 'number' && isNaN(value))) {
            return '';
        }
        return value;
    };

    // If no data, show empty state
    if (!data || data.length === 0) {
        return (
            <div
                className={`overflow-auto border border-slate-200 rounded-lg ${className}`}
                style={{ height: '600px' }}
            >
                {/* Header for empty state */}
                <div className="sticky top-0 z-10 shadow-md">
                    {customHeader ? (
                        customHeader
                    ) : (
                        <div className="flex bg-gradient-to-r from-blue-600 to-blue-700" style={{ minWidth: 'fit-content' }}>
                            {columns.map((column, index) => (
                                <div
                                    key={index}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider ${column.headerClassName || ''}`}
                                    style={{
                                        width: column.width ? `${column.width}px` : undefined,
                                        flex: column.width ? 'none' : 1,
                                        minWidth: column.width ? `${column.width}px` : undefined
                                    }}
                                >
                                    {column.header}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Empty State */}
                <div className="flex items-center justify-center h-96 text-slate-400">
                    <p>No data available</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            className={`overflow-auto border border-slate-200 rounded-lg ${className}`}
            style={{ height: '600px' }}
        >
            {/* Sticky Header */}
            <div
                className="sticky top-0 z-10 shadow-md"
                style={{ position: 'sticky', top: 0, minWidth: 'fit-content' }}
            >
                {customHeader ? (
                    customHeader
                ) : (
                    <div className="flex bg-gradient-to-r from-blue-600 to-blue-700">
                        {columns.map((column, index) => (
                            <div
                                key={index}
                                className={`px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider ${column.headerClassName || ''}`}
                                style={{
                                    width: column.width ? `${column.width}px` : undefined,
                                    flex: column.width ? 'none' : 1,
                                    minWidth: column.width ? `${column.width}px` : undefined
                                }}
                            >
                                {column.header}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Virtual Rows Container */}
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = data[virtualRow.index];
                    if (!row) return null; // Safety check

                    const isEven = virtualRow.index % 2 === 0;

                    return (
                        <div
                            key={virtualRow.index}
                            className={`flex items-center border-b border-slate-100 ${isEven ? 'bg-white' : 'bg-slate-50'
                                } hover:bg-blue-50 transition-colors duration-150`}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            {columns.map((column, colIndex) => (
                                <div
                                    key={colIndex}
                                    className={`px-4 py-3 text-sm text-slate-700 overflow-wrap-anywhere ${column.className || ''}`}
                                    style={{
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word',
                                        width: column.width ? `${column.width}px` : undefined,
                                        flex: column.width ? 'none' : 1,
                                        minWidth: column.width ? `${column.width}px` : undefined
                                    }}
                                >
                                    {getCellValue(row, column)}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default VirtualTable;
