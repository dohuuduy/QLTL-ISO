import React from 'react';

interface Column<T> {
    header: React.ReactNode;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    rowClassName?: (item: T) => string;
}

const Table = <T extends { [key: string]: any }>({ columns, data, onRowClick, actions, rowClassName }: TableProps<T>) => {
    return (
        // Wrapper div to contain the table element
        <div>
            <table className="w-full min-w-full table-auto">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`py-3 px-4 text-left text-sm font-semibold text-gray-900 ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                        {actions && (
                             <th scope="col" className="relative py-3 px-4 text-right text-sm font-semibold text-gray-900 no-print w-32">
                                Hành động
                            </th>
                        )}
                    </tr>
                </thead>
                {data.length > 0 && (
                    <tbody className="bg-white">
                        {data.map((item, rowIndex) => (
                            <tr 
                                key={item.id || item.id_phien_ban || item.id_thay_doi || item.id_phan_phoi || item.id_lich || item.id_dt || item.id_rr || rowIndex} 
                                className={`border-b border-slate-200 last:border-b-0 even:bg-slate-50 ${onRowClick ? 'hover:bg-blue-50 cursor-pointer' : ''} ${rowClassName ? rowClassName(item) : ''}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`py-4 px-4 text-sm text-slate-800 ${col.className || ''}`}
                                    >
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(item)
                                            // Handle potential undefined/null values gracefully
                                            : <span className="truncate">{String(item[col.accessor as keyof T] ?? '')}</span>}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="py-4 px-4 text-right text-sm font-medium no-print w-32">
                                        {actions(item)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
             {data.length === 0 && (
                <div className="text-center py-10 border-t border-slate-200">
                    <p className="text-gray-500">Không có dữ liệu.</p>
                </div>
            )}
        </div>
    );
};

export default Table;