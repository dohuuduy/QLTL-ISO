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
        <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        className={`py-3.5 px-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider ${col.className || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {actions && (
                                     <th scope="col" className="relative py-3.5 px-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider no-print">
                                        Hành động
                                    </th>
                                )}
                            </tr>
                        </thead>
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
                                                : String(item[col.accessor as keyof T] ?? '')}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="py-4 px-4 text-right text-sm font-medium no-print">
                                            {actions(item)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {data.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Không có dữ liệu.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Table;