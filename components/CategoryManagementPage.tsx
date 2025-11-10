
import React, { useState, useMemo, useEffect } from 'react';
import type { NhanSu, DanhMucChung } from '../types';
import Card from './ui/Card';
import Table from './ui/Table';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';
import ConfirmationDialog from './ui/ConfirmationDialog';
import Badge from './ui/Badge';
import { mockData } from '../data/mockData';

type CategoryKey = keyof typeof mockData;

interface CategoryManagementPageProps<T extends { id: string, ten: string, is_active?: boolean }> {
    title: string;
    categoryKey: CategoryKey;
    items: T[];
    columns?: {
        header: React.ReactNode;
        // FIX: Allow accessor to be a string key of T, which is supported by the Table component.
        accessor: keyof T | ((item: T) => React.ReactNode);
        sortKey: string;
    }[];
    FormComponent: React.FC<any>;
    formProps?: object;
    onSave: (categoryKey: CategoryKey, item: T) => void;
    onDelete: (categoryKey: CategoryKey, item: T) => void;
    onToggleStatus: (categoryKey: CategoryKey, item: T) => void;
    currentUser: NhanSu;
}

type SortConfig = { key: string; direction: 'ascending' | 'descending'; } | null;

const CategoryManagementPage = <T extends { id: string, ten: string, is_active?: boolean }>({
    title,
    categoryKey,
    items,
    columns,
    FormComponent,
    formProps = {},
    onSave,
    onDelete,
    onToggleStatus,
    currentUser,
}: CategoryManagementPageProps<T>) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<T | null>(null);
    const [deletingItem, setDeletingItem] = useState<T | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ten', direction: 'ascending' });
    
    useEffect(() => {
        setSortConfig({ key: 'ten', direction: 'ascending' });
    }, [categoryKey]);

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

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof T];
                const bValue = b[sortConfig.key as keyof T];
                
                if (aValue == null) return 1;
                if (bValue == null) return -1;
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return aValue.localeCompare(bValue, 'vi') * (sortConfig.direction === 'ascending' ? 1 : -1);
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

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

    const handleDeleteConfirm = () => {
        if (deletingItem) {
            onDelete(categoryKey, deletingItem);
            setDeletingItem(null);
        }
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
                    <button onClick={(e) => { e.stopPropagation(); setDeletingItem(item); }} className="text-red-600 hover:text-red-800" title="Xóa">
                        <Icon type="trash" className="h-5 w-5" />
                    </button>
                )}
            </div>
        );
    };

    const defaultColumns = [
        { header: getSortableHeader(`Tên ${title.replace('Quản lý ', '').toLowerCase()}`, 'ten'), accessor: (item: T) => item.ten, sortKey: 'ten' },
    ];

    const finalColumns = (columns || defaultColumns).concat([
        { header: 'Trạng thái', accessor: (item: T) => <Badge status={item.is_active !== false ? 'active' : 'inactive'} />, sortKey: 'is_active' }
    ]);

    const modalTitle = `${modalData ? 'Chỉnh sửa' : 'Thêm mới'} ${title.replace('Quản lý ', '')}`;
    const deletionMessage = `Bạn có chắc chắn muốn xóa '${deletingItem?.ten || ''}' không? Hành động này không thể hoàn tác.`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <Card>
                <Card.Header className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Danh sách</h3>
                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="btn-primary"
                    >
                        <Icon type="plus" className="-ml-1 mr-2 h-4 w-4" />
                        Thêm mới
                    </button>
                </Card.Header>
                <Table
                    columns={finalColumns}
                    data={sortedItems}
                    actions={renderActions}
                    rowClassName={(item: any) => item.role === 'admin' ? 'bg-sky-50' : ''}
                />
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
                <FormComponent
                    onSubmit={handleSave}
                    onCancel={closeModal}
                    initialData={modalData}
                    {...formProps}
                />
            </Modal>

            <ConfirmationDialog
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDeleteConfirm}
                title={`Xác nhận Xóa`}
                message={deletionMessage}
            />
        </div>
    );
};

export default CategoryManagementPage;
