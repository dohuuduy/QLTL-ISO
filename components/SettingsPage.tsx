import React, { useState, useMemo, useEffect } from 'react';
import type { 
    NhanSu, PhongBan, LoaiTaiLieu, CapDoTaiLieu, MucDoBaoMat, TanSuatRaSoat, HangMucThayDoi, DanhMucChung, ChucVu, ToChucDanhGia, DanhGiaVien
} from '../types';
import Card from './ui/Card';
import Tabs from './ui/Tabs';
import Table from './ui/Table';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';
import ConfirmationDialog from './ui/ConfirmationDialog';
import PersonnelForm from './forms/PersonnelForm';
import DepartmentForm from './forms/DepartmentForm';
import GenericCategoryForm from './forms/GenericCategoryForm';
import AuditorForm from './forms/AuditorForm';
import Badge from './ui/Badge';
import { translate } from '../utils/translations';
import StatusCategoryView from './StatusCategoryView';

type AllData = {
    nhanSu: NhanSu[];
    phongBan: PhongBan[];
    chucVu: ChucVu[];
    loaiTaiLieu: LoaiTaiLieu[];
    capDoTaiLieu: CapDoTaiLieu[];
    mucDoBaoMat: MucDoBaoMat[];
    tanSuatRaSoat: TanSuatRaSoat[];
    hangMucThayDoi: HangMucThayDoi[];
    danhGiaVien: DanhGiaVien[];
    toChucDanhGia: ToChucDanhGia[];
};

interface SettingsPageProps {
    allData: AllData;
    onUpdateData: React.Dispatch<React.SetStateAction<any>>; // Using 'any' for simplicity
    currentUser: NhanSu;
}

type ModalContent = {
    type: keyof AllData | 'trangThai';
    data?: any;
};

type SortConfig = { key: string; direction: 'ascending' | 'descending'; } | null;

const SettingsPage: React.FC<SettingsPageProps> = ({ allData, onUpdateData, currentUser }) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ type: keyof AllData; id: string } | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const { phongBanMap, chucVuMap, toChucDanhGiaMap } = useMemo(() => ({
        phongBanMap: new Map(allData.phongBan.filter(Boolean).map(pb => [pb.id, pb.ten])),
        chucVuMap: new Map(allData.chucVu.filter(Boolean).map(cv => [cv.id, cv.ten])),
        toChucDanhGiaMap: new Map(allData.toChucDanhGia.filter(Boolean).map(org => [org.id, org.ten])),
    }), [allData.phongBan, allData.chucVu, allData.toChucDanhGia]);

    useEffect(() => {
        setSortConfig(null);
    }, [activeTabIndex]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortableHeader = (label: string, key: string) => {
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

    const openModal = (type: keyof AllData, data: any = null) => {
        setModalContent({ type, data });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    const handleSave = (formData: any) => {
        if (!modalContent || modalContent.type === 'trangThai') return;
        const { type, data: initialData } = modalContent as { type: keyof AllData, data?: any };

        // Simple permission check
        if ((type === 'nhanSu' || type === 'danhGiaVien' || type === 'toChucDanhGia') && currentUser.role !== 'admin') {
            alert("Bạn không có quyền thực hiện hành động này.");
            return;
        }

        onUpdateData((prev: any) => {
            const currentList = prev[type] as any[];
            let newList;
            if (initialData?.id) {
                newList = currentList.map(item => item.id === initialData.id ? formData : item);
            } else {
                const newUserRole = type === 'nhanSu' ? { role: 'user' } : {};
                newList = [...currentList, { ...formData, id: `${type}-${Date.now()}`, ...newUserRole, is_active: true }];
            }
            return { ...prev, [type]: newList };
        });

        closeModal();
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        const { type, id } = deletingItem;

        if ((type === 'nhanSu' || type === 'danhGiaVien' || type === 'toChucDanhGia') && currentUser.role !== 'admin') {
            alert("Bạn không có quyền thực hiện hành động này.");
            return;
        }
        
        onUpdateData((prev: any) => {
            const currentList = prev[type] as any[];
            const newList = currentList.filter(item => item.id !== id);
            return { ...prev, [type]: newList };
        });

        setDeletingItem(null);
    };

    const handleToggleStatus = (type: keyof AllData, itemToToggle: any) => {
        onUpdateData((prev: any) => {
            const updatedList = prev[type].map((item: any) =>
                item.id === itemToToggle.id
                    ? { ...item, is_active: item.is_active === false } // if false -> true, if true/undefined -> false
                    : item
            );
            return { ...prev, [type]: updatedList };
        });
    };

    const renderActions = (type: keyof AllData) => (item: any) => {
        const isAdminOnlyAction = (type === 'nhanSu' || type === 'danhGiaVien' || type === 'toChucDanhGia') && currentUser.role !== 'admin';
        if (isAdminOnlyAction) return null;

        const isSelf = item.id === currentUser.id;
        const isOwnDepartment = type === 'phongBan' && item.id === currentUser.phong_ban_id;
        const isOwnJobTitle = type === 'chucVu' && item.id === currentUser.chuc_vu;
        const canBeDisabled = !isSelf && !isOwnDepartment && !isOwnJobTitle;

        const isActive = item.is_active !== false;
        const statusIcon = isActive ? 'archive' : 'check-circle';
        const statusTitle = isActive ? "Vô hiệu hóa (lưu trữ)" : "Kích hoạt lại";
        const statusColorClass = isActive ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-800";

        return (
            <div className="flex items-center justify-end space-x-3">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(type, item); }} 
                    className={statusColorClass}
                    title={statusTitle}
                    disabled={!canBeDisabled}
                >
                    <Icon type={statusIcon} className={`h-5 w-5 ${!canBeDisabled ? 'opacity-30 cursor-not-allowed' : ''}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); openModal(type, item); }} className="text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
                    <Icon type="pencil" className="h-5 w-5" />
                </button>
                 {!isSelf && (
                    <button onClick={(e) => { e.stopPropagation(); setDeletingItem({ type, id: item.id }); }} className="text-red-600 hover:text-red-800" title="Xóa">
                        <Icon type="trash" className="h-5 w-5" />
                    </button>
                )}
            </div>
        );
    }
    
    const getNhanSuRowClassName = (user: NhanSu) => {
        if (user.role === 'admin') {
            return 'bg-sky-50';
        }
        return '';
    };

    const tabsConfig = useMemo(() => [
        { title: 'Nhân sự', key: 'nhanSu', data: allData.nhanSu, rowClassName: getNhanSuRowClassName, isManageable: true },
        { title: 'Phòng ban', key: 'phongBan', data: allData.phongBan, isManageable: true },
        { title: 'Chức vụ', key: 'chucVu', data: allData.chucVu, isManageable: true },
        { title: 'Trạng thái', key: 'trangThai', data: [], isManageable: false },
        { title: 'Loại tài liệu', key: 'loaiTaiLieu', data: allData.loaiTaiLieu, isManageable: true },
        { title: 'Cấp độ tài liệu', key: 'capDoTaiLieu', data: allData.capDoTaiLieu, isManageable: true },
        { title: 'Mức độ bảo mật', key: 'mucDoBaoMat', data: allData.mucDoBaoMat, isManageable: true },
        { title: 'Tần suất rà soát', key: 'tanSuatRaSoat', data: allData.tanSuatRaSoat, isManageable: true },
        { title: 'Hạng mục thay đổi', key: 'hangMucThayDoi', data: allData.hangMucThayDoi, isManageable: true },
        { title: 'Đánh giá viên', key: 'danhGiaVien', data: allData.danhGiaVien, isManageable: true },
        { title: 'Tổ chức đánh giá', key: 'toChucDanhGia', data: allData.toChucDanhGia, isManageable: true },
    ], [allData]);

    const sortedData = useMemo(() => {
        const currentTab = tabsConfig[activeTabIndex];
        if (!currentTab.isManageable) return [];

        if (!sortConfig) return currentTab.data;

        const currentTabKey = currentTab.key as keyof AllData;
        let dataToSort = [...allData[currentTabKey]];

        dataToSort.sort((a: any, b: any) => {
            let aValue: any;
            let bValue: any;
            
            if (currentTabKey === 'nhanSu') {
                switch (sortConfig.key) {
                    case 'chuc_vu':
                        aValue = chucVuMap.get(a.chuc_vu) || '';
                        bValue = chucVuMap.get(b.chuc_vu) || '';
                        break;
                    case 'phong_ban_id':
                        aValue = phongBanMap.get(a.phong_ban_id) || '';
                        bValue = phongBanMap.get(b.phong_ban_id) || '';
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                }
            } else if (currentTabKey === 'danhGiaVien') {
                 switch (sortConfig.key) {
                    case 'to_chuc_id':
                        aValue = toChucDanhGiaMap.get(a.to_chuc_id) || '';
                        bValue = toChucDanhGiaMap.get(b.to_chuc_id) || '';
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                }
            } else {
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
            }

            if (aValue == null) return 1;
            if (bValue == null) return -1;
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        
        return dataToSort;
    }, [activeTabIndex, allData, sortConfig, tabsConfig, chucVuMap, phongBanMap, toChucDanhGiaMap]);
    
    const tabsForRender = useMemo(() => {
        return tabsConfig.map((tab, index) => {
             if (tab.key === 'trangThai') {
                return {
                    title: tab.title,
                    content: <StatusCategoryView />
                };
            }

            let columns: any[];
            if (tab.key === 'nhanSu') {
                columns = [
                    { header: getSortableHeader('Tên nhân sự', 'ten'), accessor: 'ten' },
                    { header: getSortableHeader('Chức vụ', 'chuc_vu'), accessor: (item: NhanSu) => chucVuMap.get(item.chuc_vu) || 'N/A' },
                    { header: getSortableHeader('Phòng ban', 'phong_ban_id'), accessor: (item: NhanSu) => phongBanMap.get(item.phong_ban_id) || 'N/A' },
                    { header: getSortableHeader('Vai trò', 'role'), accessor: (item: NhanSu) => <Badge status={item.role}/>},
                    { header: 'Trạng thái', accessor: (item: NhanSu) => <Badge status={item.is_active !== false ? 'active' : 'inactive'} /> },
                ];
            } else if (tab.key === 'danhGiaVien') {
                 columns = [
                    { header: getSortableHeader('Tên đánh giá viên', 'ten'), accessor: 'ten' },
                    { header: getSortableHeader('Loại', 'loai'), accessor: (item: DanhGiaVien) => item.loai === 'internal' ? 'Nội bộ' : 'Bên ngoài' },
                    { header: getSortableHeader('Tổ chức', 'to_chuc_id'), accessor: (item: DanhGiaVien) => toChucDanhGiaMap.get(item.to_chuc_id || '') || '' },
                    { header: 'Trạng thái', accessor: (item: any) => <Badge status={item.is_active !== false ? 'active' : 'inactive'} /> },
                ];
            } else {
                columns = [
                    { header: getSortableHeader(`Tên ${tab.title.toLowerCase()}`, 'ten'), accessor: 'ten', className: 'w-4/5' },
                    { header: 'Trạng thái', accessor: (item: any) => <Badge status={item.is_active !== false ? 'active' : 'inactive'} /> },
                ];
            }

            return {
                title: tab.title,
                content: (
                    <div className="p-0 sm:p-0">
                        <Table
                            columns={columns}
                            data={index === activeTabIndex ? sortedData : tab.data}
                            actions={renderActions(tab.key as keyof AllData)}
                            rowClassName={(tab as any).rowClassName}
                        />
                    </div>
                )
            };
        });
    }, [tabsConfig, activeTabIndex, sortedData, renderActions, getSortableHeader, chucVuMap, phongBanMap, toChucDanhGiaMap]);
    
    const currentTab = tabsConfig[activeTabIndex];
    const canManageCurrentTab = currentTab.isManageable && !((currentTab.key === 'nhanSu' || currentTab.key === 'danhGiaVien' || currentTab.key === 'toChucDanhGia') && currentUser.role !== 'admin');

    const renderModalContent = () => {
        if (!modalContent || modalContent.type === 'trangThai') return null;
        const { type, data } = modalContent as { type: keyof AllData, data?: any };
        switch (type) {
            case 'nhanSu':
                return <PersonnelForm onSubmit={handleSave} onCancel={closeModal} initialData={data} phongBanList={allData.phongBan} chucVuList={allData.chucVu} currentUser={currentUser} />;
            case 'phongBan':
                return <DepartmentForm onSubmit={handleSave} onCancel={closeModal} initialData={data} />;
            case 'toChucDanhGia': {
                const orgCategoryName = tabsConfig.find(t => t.key === type)?.title || 'Danh mục';
                return <GenericCategoryForm onSubmit={handleSave} onCancel={closeModal} initialData={data} categoryName={orgCategoryName} />;
            }
            case 'danhGiaVien':
                return <AuditorForm onSubmit={handleSave} onCancel={closeModal} initialData={data} organizations={allData.toChucDanhGia} />;
            default: {
                const categoryName = tabsConfig.find(t => t.key === type)?.title || 'Danh mục';
                return <GenericCategoryForm onSubmit={handleSave} onCancel={closeModal} initialData={data} categoryName={categoryName} />;
            }
        }
    };
    
    const getModalTitle = () => {
        if (!modalContent) return '';
        const isEditing = !!modalContent.data;
        const prefix = isEditing ? 'Chỉnh sửa' : 'Thêm mới';
        const categoryName = tabsConfig.find(t => t.key === modalContent.type)?.title || 'mục';
        return `${prefix} ${categoryName}`;
    };

    const deletionInfo = useMemo(() => {
        if (!deletingItem) return { title: 'Xác nhận Xóa', message: 'Bạn có chắc chắn muốn xóa mục này không?' };

        const { type, id } = deletingItem;
        const item = (allData[type] as any[]).find((d: any) => d.id === id);
        const categoryName = tabsConfig.find(t => t.key === type)?.title || 'Mục';

        const title = `Xác nhận Xóa ${categoryName}`;
        const message = item?.ten
            ? `Bạn có chắc chắn muốn xóa ${categoryName.toLowerCase()} '${item.ten}' không? Hành động này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn xóa ${categoryName.toLowerCase()} này không? Hành động này không thể hoàn tác.`;

        return { title, message };
    }, [deletingItem, allData, tabsConfig]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 no-print">Cài đặt Danh mục Hệ thống</h1>
            <Card>
                <Card.Header className="flex items-center justify-between">
                     <h3 className="text-base font-semibold text-gray-900">Quản lý danh mục</h3>
                      {canManageCurrentTab ? (
                         <button
                            type="button"
                            onClick={() => openModal(currentTab.key as keyof AllData)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none no-print"
                        >
                            <Icon type="plus" className="-ml-1 mr-2 h-4 w-4" />
                            Thêm {currentTab.title}
                        </button>
                    ) : null}
                </Card.Header>
                <Tabs
                    tabs={tabsForRender}
                    activeTabIndex={activeTabIndex}
                    onTabChange={setActiveTabIndex}
                />
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
            
            <ConfirmationDialog
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDelete}
                title={deletionInfo.title}
                message={deletionInfo.message}
            />
        </div>
    );
};

export default SettingsPage;