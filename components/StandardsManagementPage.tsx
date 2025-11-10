import React, { useState, useMemo } from 'react';
import type { TieuChuan, NhanSu } from '../types';
import Card from './ui/Card';
import Table from './ui/Table';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';
import ConfirmationDialog from './ui/ConfirmationDialog';
import StandardForm from './forms/StandardForm';
import Badge from './ui/Badge';
import { formatDateForDisplay } from '../utils/dateUtils';
import { exportToCsv } from '../utils/exportUtils';
import ExportDropdown from './ui/ExportDropdown';

interface StandardsManagementPageProps {
    standards: TieuChuan[];
    onUpdateData: React.Dispatch<React.SetStateAction<any>>;
    currentUser: NhanSu;
}

type SortConfig = {
    key: keyof TieuChuan;
    direction: 'ascending' | 'descending';
} | null;

const StandardsManagementPage: React.FC<StandardsManagementPageProps> = ({ standards, onUpdateData, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStandard, setEditingStandard] = useState<TieuChuan | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ten', direction: 'ascending' });

    const sortedStandards = useMemo(() => {
        let sortableItems = [...standards];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue == null) return 1;
                if (bValue == null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [standards, sortConfig]);

    const requestSort = (key: keyof TieuChuan) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

     const getSortableHeader = (label: string, key: keyof TieuChuan) => {
        const isSorting = sortConfig?.key === key;
        const sortIcon = isSorting 
            ? (sortConfig.direction === 'ascending' ? 'chevron-up' : 'chevron-down')
            : 'chevron-down';
        
        return (
            <button 
                onClick={() => requestSort(key)} 
                className="group inline-flex items-center gap-1"
            >
                <span>{label}</span>
                <Icon 
                    type={sortIcon} 
                    className={`h-4 w-4 transition-opacity ${isSorting ? 'opacity-100 text-gray-700' : 'opacity-0 text-gray-400 group-hover:opacity-100'}`} 
                />
            </button>
        );
    };

    const openModal = (standard: TieuChuan | null = null) => {
        setEditingStandard(standard);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingStandard(null);
        setIsModalOpen(false);
    };

    const handleSave = (formData: TieuChuan) => {
        onUpdateData((prev: any) => {
            let newList;
            if (editingStandard) {
                newList = prev.tieuChuan.map((item: TieuChuan) => item.id === editingStandard.id ? formData : item);
            } else {
                newList = [...prev.tieuChuan, { ...formData, id: `tc-${Date.now()}`, is_active: true }];
            }
            return { ...prev, tieuChuan: newList.sort((a: TieuChuan, b: TieuChuan) => a.ten.localeCompare(b.ten)) };
        });
        closeModal();
    };

    const handleDelete = () => {
        if (!deletingId) return;
        onUpdateData((prev: any) => ({
            ...prev,
            tieuChuan: prev.tieuChuan.filter((item: TieuChuan) => item.id !== deletingId),
        }));
        setDeletingId(null);
    };

    const handleToggleStatus = (standardToToggle: TieuChuan) => {
        onUpdateData((prev: any) => {
            const updatedList = prev.tieuChuan.map((item: TieuChuan) => {
                if (item.id === standardToToggle.id) {
                    const newActiveState = item.is_active === false;
                    const updatedItem = { ...item, is_active: newActiveState };

                    // If reactivating, and the end date is in the past, clear the end date.
                    if (newActiveState && updatedItem.ngay_ket_thuc_ap_dung) {
                        const endDate = new Date(updatedItem.ngay_ket_thuc_ap_dung); // UTC midnight
                        const now = new Date();
                        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                        if (endDate < todayUTC) {
                            updatedItem.ngay_ket_thuc_ap_dung = undefined;
                        }
                    }
                    return updatedItem;
                }
                return item;
            });
            return { ...prev, tieuChuan: updatedList };
        });
    };
    
    const canManage = currentUser.role === 'admin';

    const renderActions = (item: TieuChuan) => (
        <div className="flex items-center justify-end space-x-3">
            <button
                onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
                className={item.is_active !== false ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-800"}
                title={item.is_active !== false ? "Vô hiệu hóa" : "Kích hoạt"}
            >
                <Icon type={item.is_active !== false ? 'archive' : 'check-circle'} className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); openModal(item); }} className="text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
                <Icon type="pencil" className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }} className="text-red-600 hover:text-red-800" title="Xóa">
                <Icon type="trash" className="h-5 w-5" />
            </button>
        </div>
    );

    const deletionInfo = useMemo(() => {
        if (!deletingId) return { title: 'Xác nhận Xóa', message: 'Bạn có chắc chắn muốn xóa mục này không?' };
        const standard = standards.find(s => s.id === deletingId);
        return {
            title: 'Xác nhận Xóa Tiêu chuẩn',
            message: `Bạn có chắc chắn muốn xóa tiêu chuẩn '${standard?.ten || ''}' không? Hành động này không thể hoàn tác.`,
        };
    }, [deletingId, standards]);
    
    const handlePrint = () => window.print();
    
    const handleExportCsv = () => {
         const dataToExport = sortedStandards.map(s => ({
            ten: s.ten,
            ten_viet_tat: s.ten_viet_tat,
            phien_ban: s.phien_ban,
            ngay_ap_dung: formatDateForDisplay(s.ngay_ap_dung),
            ngay_ket_thuc_ap_dung: formatDateForDisplay(s.ngay_ket_thuc_ap_dung),
            trang_thai: s.is_active !== false ? 'Đang hoạt động' : 'Vô hiệu hóa',
        }));

        const headers = {
            ten: 'Tên Tiêu chuẩn',
            ten_viet_tat: 'Tên viết tắt',
            phien_ban: 'Phiên bản',
            ngay_ap_dung: 'Ngày áp dụng',
            ngay_ket_thuc_ap_dung: 'Ngày kết thúc',
            trang_thai: 'Trạng thái',
        };

        exportToCsv(dataToExport, headers, 'danh_sach_tieu_chuan.csv');
    };
    

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between no-print">
                 <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Tiêu chuẩn</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Quản lý các tiêu chuẩn chất lượng, môi trường, an toàn và các tiêu chuẩn khác.
                    </p>
                </div>
                 <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-x-2">
                     <ExportDropdown 
                        onPrint={handlePrint}
                        onExportCsv={handleExportCsv}
                    />
                    {canManage && (
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Icon type="plus" className="-ml-1 mr-2 h-5 w-5" />
                            Thêm Tiêu chuẩn
                        </button>
                    )}
                </div>
            </div>
            
            <Card>
                <Table<TieuChuan>
                    columns={[
                        { header: getSortableHeader('Tên Tiêu chuẩn', 'ten'), accessor: 'ten', className: 'font-medium text-gray-900' },
                        { header: getSortableHeader('Viết tắt', 'ten_viet_tat'), accessor: 'ten_viet_tat' },
                        { header: getSortableHeader('Phiên bản', 'phien_ban'), accessor: 'phien_ban' },
                        { header: getSortableHeader('Ngày áp dụng', 'ngay_ap_dung'), accessor: (item) => formatDateForDisplay(item.ngay_ap_dung) },
                        { header: getSortableHeader('Ngày kết thúc', 'ngay_ket_thuc_ap_dung'), accessor: (item) => formatDateForDisplay(item.ngay_ket_thuc_ap_dung) },
                        { header: 'Trạng thái', accessor: (item) => <Badge status={item.is_active !== false ? 'active' : 'inactive'} /> },
                    ]}
                    data={sortedStandards}
                    actions={canManage ? renderActions : undefined}
                />
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStandard ? 'Chỉnh sửa Tiêu chuẩn' : 'Thêm mới Tiêu chuẩn'}>
                <StandardForm
                    onSubmit={handleSave}
                    onCancel={closeModal}
                    initialData={editingStandard}
                />
            </Modal>
            
            <ConfirmationDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title={deletionInfo.title}
                message={deletionInfo.message}
            />
        </div>
    );
};

export default StandardsManagementPage;