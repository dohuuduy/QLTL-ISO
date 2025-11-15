
import React, { useState, useMemo, useEffect } from 'react';
import type { NhanSu } from '../types';
import Card from './ui/Card';
import Table from './ui/Table';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';
import Badge from './ui/Badge';
import { mockData } from '../data/mockData';
import Pagination from './ui/Pagination';

// NEW IMPORTS
import ExportDropdown from './ui/ExportDropdown';
import PrintReportLayout from './PrintReportLayout';
import { exportToCsv, exportVisibleReportToWord } from '../utils/exportUtils';
import { translate } from '../utils/translations';


type CategoryKey = keyof typeof mockData;

interface CategoryManagementPageProps<T extends { id: string, ten: string, is_active?: boolean }> {
    title: string;
    categoryKey: CategoryKey;
    items: T[];
    columns?: {
        header: React.ReactNode;
        accessor: keyof T | ((item: T) => React.ReactNode);
        sortKey: string;
        width?: string;
    }[];
    FormComponent: React.FC<any>;
    formProps?: object;
    onSave: (categoryKey: CategoryKey, item: T) => void;
    onRequestDelete: (categoryKey: CategoryKey, item: T) => void;
    onToggleStatus: (categoryKey: CategoryKey, item: T) => void;
    currentUser: NhanSu;
}

type SortConfig = { key: string; direction: 'ascending' | 'descending'; } | null;

const normalizeString = (str: string) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const CategoryManagementPage = <T extends { id: string, ten: string, is_active?: boolean }>({
    title,
    categoryKey,
    items,
    columns,
    FormComponent,
    formProps = {},
    onSave,
    onRequestDelete,
    onToggleStatus,
    currentUser,
}: CategoryManagementPageProps<T>) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<T | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ten', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [filters, setFilters] = useState({ searchTerm: '', status: 'all' });

    useEffect(() => {
        setCurrentPage(1);
        setSortConfig({ key: 'ten', direction: 'ascending' });
        setFilters({ searchTerm: '', status: 'all' });
    }, [categoryKey]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, filters, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortableHeader = (label: string, sortKey: string) => {
        const isSorting = sortConfig?.key === sortKey;
        const sortIcon = isSorting ? (sortConfig.direction === 'ascending' ? 'chevron-up' : 'chevron-down') : 'chevron-down';
        
        return (
            <button onClick={() => requestSort(sortKey)} className="group inline-flex items-center gap-1">
                <span>{label}</span>
                <Icon type={sortIcon} className={`h-4 w-4 transition-opacity ${isSorting ? 'opacity-100 text-gray-700' : 'opacity-0 text-gray-400 group-hover:opacity-100'}`} />
            </button>
        );
    };

    const filteredItems = useMemo(() => {
        const normalizedSearchTerm = normalizeString(filters.searchTerm);

        return items.filter(item => {
            const matchesSearch = normalizedSearchTerm ? normalizeString(item.ten).includes(normalizedSearchTerm) : true;
            
            const matchesStatus = (() => {
                if (filters.status === 'all') return true;
                if (filters.status === 'active') return item.is_active !== false;
                if (filters.status === 'inactive') return item.is_active === false;
                return true;
            })();

            return matchesSearch && matchesStatus;
        });
    }, [items, filters]);


    const sortedItems = useMemo(() => {
        let sortableItems = [...filteredItems];
        if (sortConfig) {
            sortableItems.sort((a, b) => {
                // Special handling for accessor functions in columns
                const columnToSort = (columns || []).find(c => c.sortKey === sortConfig.key);
                let aValue: any;
                let bValue: any;

                if (columnToSort && typeof columnToSort.accessor === 'function') {
                    // This is a naive sort for rendered content, might not be perfect for complex components
                    const renderedA = columnToSort.accessor(a);
                    const renderedB = columnToSort.accessor(b);
                    aValue = typeof renderedA === 'string' ? renderedA : JSON.stringify(renderedA);
                    bValue = typeof renderedB === 'string' ? renderedB : JSON.stringify(renderedB);
                } else {
                     aValue = a[sortConfig.key as keyof T];
                     bValue = b[sortConfig.key as keyof T];
                }
                
                if (aValue == null) return 1;
                if (bValue == null) return -1;
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return aValue.localeCompare(bValue, 'vi') * (sortConfig.direction === 'ascending' ? 1 : -1);
                }
                
                if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                    return (aValue === bValue ? 0 : aValue ? -1 : 1) * (sortConfig.direction === 'ascending' ? 1 : -1);
                }


                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredItems, sortConfig, columns]);
    
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedItems.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedItems, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

    const openModal = (data: T | null = null) => {
        setModalData(data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    const handleSave = (formData: T) => {
        onSave(categoryKey, formData);
        closeModal();
    };
    
    const defaultColumns = [
        { header: `Tên ${title.replace('Quản lý ', '').toLowerCase()}`, accessor: (item: T) => item.ten, sortKey: 'ten', width: '70%' },
    ];

    const finalColumns = (columns || defaultColumns).map(col => ({
        ...col,
        header: typeof col.header === 'string' && col.sortKey
            ? getSortableHeader(col.header, col.sortKey)
            : col.header,
    })).concat([
        { header: getSortableHeader('Trạng thái', 'is_active'), accessor: (item: T) => <Badge status={item.is_active !== false ? 'active' : 'inactive'} />, sortKey: 'is_active', width: columns ? '15%' : '30%' }
    ]);
    
    const printLayoutProps = useMemo(() => {
        const baseColumns = (columns || defaultColumns);
        const printColumns = baseColumns.map(col => ({
          header: typeof col.header === 'string' ? col.header.replace(/<[^>]*>?/gm, '') : String(col.header),
          accessor: (item: T): string => {
            if (typeof col.accessor === 'function') {
              const value = col.accessor(item);
              if (React.isValidElement(value)) {
                 if (value.type === Badge) {
                    return translate((value.props as { status: string }).status);
                 }
                 return ''; // Don't print complex components
              }
              return String(value ?? '');
            }
            return String(item[col.accessor as keyof T] ?? '');
          },
          width: col.width
        }));
        
        printColumns.push({
            header: 'Trạng thái',
            accessor: (item: T) => item.is_active !== false ? 'Đang hoạt động' : 'Vô hiệu hóa',
            width: columns ? '15%' : '30%'
        });

        const activeFilters: Record<string, string> = {};
        if (filters.searchTerm) {
            activeFilters['Từ khóa'] = filters.searchTerm;
        }
        if (filters.status !== 'all') {
            activeFilters['Trạng thái'] = filters.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa';
        }

        return {
            title: title,
            filters: activeFilters,
            columns: printColumns,
            data: sortedItems,
        };
    }, [sortedItems, filters, title, columns, defaultColumns]);

    const handlePrint = () => window.print();

    const handleExportWord = () => {
        const filename = normalizeString(title).replace(/\s+/g, '_');
        exportVisibleReportToWord(filename);
    };

    const handleExportCsv = () => {
        if (!printLayoutProps) return;

        const headers: { [key: string]: string } = {};
        const keys: string[] = [];
        printLayoutProps.columns.forEach((col, i) => {
            const key = `col_${i}`;
            keys.push(key);
            headers[key] = col.header;
        });

        const dataToExport = printLayoutProps.data.map(item => {
            const row: { [key: string]: any } = {};
            printLayoutProps.columns.forEach((col, i) => {
                row[keys[i]] = col.accessor(item);
            });
            return row;
        });

        const filename = normalizeString(title).replace(/\s+/g, '_') + '.csv';
        exportToCsv(dataToExport, headers, filename);
    };


    const renderActions = (item: T) => {
        const isSelf = 'ten_dang_nhap' in item && (item as any).id === currentUser.id;
        const canBeDisabled = !isSelf;
        const isActive = item.is_active !== false;

        return (
            <div className="flex items-center justify-end space-x-3">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(categoryKey, item); }}
                    className={isActive ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-800"}
                    title={isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                    disabled={!canBeDisabled}
                >
                    <Icon type={isActive ? 'archive' : 'check-circle'} className={`h-5 w-5 ${!canBeDisabled ? 'opacity-30 cursor-not-allowed' : ''}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); openModal(item); }} className="text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
                    <Icon type="pencil" className="h-5 w-5" />
                </button>
                {!isSelf && (
                    <button onClick={(e) => { e.stopPropagation(); onRequestDelete(categoryKey, item); }} className="text-red-600 hover:text-red-800" title="Xóa">
                        <Icon type="trash" className="h-5 w-5" />
                    </button>
                )}
            </div>
        );
    };

    const modalTitle = `${modalData ? 'Chỉnh sửa' : 'Thêm mới'} ${title.replace('Quản lý ', '')}`;

    return (
        <>
            {printLayoutProps && <PrintReportLayout {...printLayoutProps} currentUser={currentUser} />}
            <div className="space-y-6 no-print">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-x-2">
                         <ExportDropdown 
                            onPrint={handlePrint}
                            onExportCsv={handleExportCsv}
                            onExportWord={handleExportWord}
                        />
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="btn-primary btn-responsive"
                            title="Thêm mới"
                        >
                            <Icon type="plus" className="btn-icon h-5 w-5" />
                            <span className="btn-text">Thêm mới</span>
                        </button>
                    </div>
                </div>

                <Card>
                    <Card.Body>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label htmlFor="search-input" className="form-label">Tìm kiếm theo tên</label>
                                <div className="search-input-container">
                                    <Icon type="search" className="search-input-icon h-5 w-5" />
                                    <input
                                        id="search-input"
                                        type="text"
                                        placeholder="Nhập tên để tìm kiếm..."
                                        value={filters.searchTerm}
                                        onChange={(e) => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
                                        className="form-input search-input"
                                    />
                                    {filters.searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setFilters(f => ({ ...f, searchTerm: '' }))}
                                            className="search-input-clear-btn"
                                            title="Xóa"
                                        >
                                            <Icon type="x-mark" className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="status-filter" className="form-label">Trạng thái</label>
                                <select
                                    id="status-filter"
                                    value={filters.status}
                                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                                    className="form-select"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Vô hiệu hóa</option>
                                </select>
                            </div>
                        </div>
                    </Card.Body>
                    <Table
                        columns={finalColumns as any}
                        data={paginatedItems}
                        actions={renderActions}
                        onRowClick={(item) => openModal(item)}
                        rowClassName={(item: any) => item.role === 'admin' ? 'bg-sky-50' : ''}
                    />
                    {sortedItems.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        >
                            <div className="flex items-center gap-x-4">
                                <p className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                    - <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedItems.length)}</span>
                                    {' '}trên <span className="font-medium">{sortedItems.length}</span> mục
                                </p>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="items-per-page" className="text-sm text-gray-700">Hiển thị:</label>
                                    <select
                                        id="items-per-page"
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="form-select py-1 w-auto"
                                    >
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm text-gray-700">dòng/trang</span>
                                </div>
                            </div>
                        </Pagination>
                    )}
                </Card>

                <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
                    <FormComponent
                        onSubmit={handleSave}
                        onCancel={closeModal}
                        initialData={modalData}
                        currentUser={currentUser}
                        {...formProps}
                    />
                </Modal>
            </div>
        </>
    );
};

export default CategoryManagementPage;
