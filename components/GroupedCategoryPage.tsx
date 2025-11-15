


import React, { useState, useEffect, useMemo } from 'react';
import Tabs from './ui/Tabs';
import CategoryManagementPage from './CategoryManagementPage';
import StandardsManagementPage from './StandardsManagementPage';

// Forms
import PersonnelForm from './forms/PersonnelForm';
import DepartmentForm from './forms/DepartmentForm';
import GenericCategoryForm from './forms/GenericCategoryForm';
import AuditorForm from './forms/AuditorForm';

// FIX: Import `NhanSu` and `DanhGiaVien` types to be used in `getColumnsForCategory` function.
import type { NhanSu, DanhGiaVien } from '../types';
import { mockData } from '../data/mockData';

// Import Smart Delete Dialog
import UsageConfirmationDialog from './ui/UsageConfirmationDialog';
import { translate } from '../utils/translations';


type GroupType = 'org' | 'doc' | 'audit';

interface GroupedCategoryPageProps {
    group: GroupType;
    title: string;
    allData: typeof mockData;
    onSaveCategory: (categoryKey: keyof typeof mockData, item: any) => void;
    onDeleteCategory: (categoryKey: keyof typeof mockData, item: any) => void;
    onToggleCategoryStatus: (categoryKey: keyof typeof mockData, item: any) => void;
    onUpdateData: React.Dispatch<React.SetStateAction<any>>;
    currentUser: NhanSu;
}

const orgCategories = [
    { key: 'nhanSu' as keyof typeof mockData, title: 'Nhân sự', Component: PersonnelForm, props: (data: any) => ({ chucVuList: data.chucVu, phongBanList: data.phongBan }) },
    { key: 'phongBan' as keyof typeof mockData, title: 'Phòng ban', Component: DepartmentForm, props: () => ({}) },
    { key: 'chucVu' as keyof typeof mockData, title: 'Chức vụ', Component: GenericCategoryForm, props: () => ({ categoryName: 'Chức vụ' }) },
];

const docCategories = [
    { key: 'loaiTaiLieu' as keyof typeof mockData, title: 'Loại tài liệu', Component: GenericCategoryForm, props: () => ({ categoryName: 'Loại tài liệu' }) },
    { key: 'capDoTaiLieu' as keyof typeof mockData, title: 'Cấp độ tài liệu', Component: GenericCategoryForm, props: () => ({ categoryName: 'Cấp độ tài liệu' }) },
    { key: 'mucDoBaoMat' as keyof typeof mockData, title: 'Mức độ bảo mật', Component: GenericCategoryForm, props: () => ({ categoryName: 'Mức độ bảo mật' }) },
    { key: 'tanSuatRaSoat' as keyof typeof mockData, title: 'Tần suất rà soát', Component: GenericCategoryForm, props: () => ({ categoryName: 'Tần suất rà soát' }) },
    { key: 'hangMucThayDoi' as keyof typeof mockData, title: 'Hạng mục thay đổi', Component: GenericCategoryForm, props: () => ({ categoryName: 'Hạng mục thay đổi' }) },
];

const auditCategories = [
    { key: 'danhGiaVien' as keyof typeof mockData, title: 'Đánh giá viên', Component: AuditorForm, props: (data: any) => ({ organizations: data.toChucDanhGia }) },
    { key: 'toChucDanhGia' as keyof typeof mockData, title: 'Tổ chức đánh giá', Component: GenericCategoryForm, props: () => ({ categoryName: 'Tổ chức đánh giá' }) },
];

// FIX: Type the `data` parameter and remove explicit `any` to allow for proper type inference, fixing the 'unknown' type error.
const getColumnsForCategory = (key: string, data: typeof mockData) => {
    switch (key) {
        case 'nhanSu':
            const phongBanMap = new Map(data.phongBan.map((p) => [p.id, p.ten]));
            const chucVuMap = new Map(data.chucVu.map((c) => [c.id, c.ten]));
            return [
                { header: 'Tên nhân sự', accessor: 'ten', sortKey: 'ten', width: '25%' },
                { header: 'Email', accessor: 'email', sortKey: 'email', width: '20%' },
                { header: 'Tên đăng nhập', accessor: 'ten_dang_nhap', sortKey: 'ten_dang_nhap', width: '15%' },
                { header: 'Phòng ban', accessor: (item: NhanSu): React.ReactNode => phongBanMap.get(item.phong_ban_id) || '', sortKey: 'phong_ban_id', width: '20%' },
                { header: 'Chức vụ', accessor: (item: NhanSu): React.ReactNode => chucVuMap.get(item.chuc_vu) || '', sortKey: 'chuc_vu', width: '15%' },
            ];
        case 'danhGiaVien':
            const orgMap = new Map(data.toChucDanhGia.map((o) => [o.id, o.ten]));
            return [
                 { header: 'Tên đánh giá viên', accessor: 'ten', sortKey: 'ten', width: '40%' },
                 { header: 'Loại', accessor: (item: DanhGiaVien): React.ReactNode => item.loai === 'internal' ? 'Nội bộ' : 'Bên ngoài', sortKey: 'loai', width: '25%' },
                 { header: 'Tổ chức', accessor: (item: DanhGiaVien): React.ReactNode => orgMap.get(item.to_chuc_id || '') || '', sortKey: 'to_chuc_id', width: '30%' },
            ]
        default:
            return null; // Let CategoryManagementPage use its default
    }
}

export const GroupedCategoryPage: React.FC<GroupedCategoryPageProps> = ({
    group,
    title,
    allData,
    onSaveCategory,
    onDeleteCategory,
    onToggleCategoryStatus,
    onUpdateData,
    currentUser,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [categories, setCategories] = useState<any[]>([]);
    
    // State for Smart Delete functionality
    const [itemToDelete, setItemToDelete] = useState<{ categoryKey: keyof typeof mockData, item: any } | null>(null);
    const [isItemInUse, setIsItemInUse] = useState(false);


    useEffect(() => {
        if (group === 'org') {
            setCategories(orgCategories);
        } else if (group === 'doc') {
            setCategories(docCategories);
        } else if (group === 'audit') {
            const newCategories = [
                ...auditCategories,
                { key: 'tieuChuan', title: 'Tiêu chuẩn', Component: null, props: () => ({}) }
            ];
            setCategories(newCategories);
        }
        setActiveTab(0);
    }, [group]);
    
    // Handler to intercept delete requests from child components
    const handleRequestDelete = (categoryKey: keyof typeof mockData, item: any) => {
        const checkUsage = () => {
            switch (categoryKey) {
                case 'phongBan':
                    return allData.documents.some(d => d.phong_ban_quan_ly === item.id) ||
                           allData.nhanSu.some(ns => ns.phong_ban_id === item.id) ||
                           allData.distributions.some(d => d.phong_ban_nhan === item.id);
                case 'chucVu':
                    return allData.nhanSu.some(ns => ns.chuc_vu === item.id);
                case 'loaiTaiLieu':
                    return allData.documents.some(d => d.loai_tai_lieu === item.id);
                case 'capDoTaiLieu':
                    return allData.documents.some(d => d.cap_do === item.id);
                case 'mucDoBaoMat':
                    return allData.documents.some(d => d.muc_do_bao_mat === item.id);
                case 'tanSuatRaSoat':
                    return allData.reviewSchedules.some(rs => rs.tan_suat === item.id);
                case 'hangMucThayDoi':
                    return allData.changeLogs.some(cl => cl.hang_muc === item.id);
                case 'tieuChuan':
                    return allData.documents.some(d => d.tieu_chuan_ids.includes(item.id)) ||
                           allData.auditSchedules.some(a => a.tieu_chuan_ids.includes(item.id));
                case 'danhGiaVien':
                    return allData.auditSchedules.some(a => a.chuyen_gia_danh_gia_truong_id === item.id || a.doan_danh_gia_ids.includes(item.id));
                case 'toChucDanhGia':
                    return allData.auditSchedules.some(a => a.to_chuc_danh_gia_id === item.id);
                default:
                    return false;
            }
        };
        
        setIsItemInUse(checkUsage());
        setItemToDelete({ categoryKey, item });
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onDeleteCategory(itemToDelete.categoryKey, itemToDelete.item);
            setItemToDelete(null);
        }
    };

    const handleConfirmDisable = () => {
        if (itemToDelete) {
            // Ensure we only disable, not re-enable
            if (itemToDelete.item.is_active !== false) {
                 onToggleCategoryStatus(itemToDelete.categoryKey, itemToDelete.item);
            }
            setItemToDelete(null);
        }
    };

    const handleCloseDialog = () => {
        setItemToDelete(null);
    };

    const tabs = useMemo(() => categories.map(cat => ({
        title: cat.title,
        content: (
            cat.key === 'tieuChuan' ? (
                <StandardsManagementPage 
                    standards={allData.tieuChuan}
                    onSave={onSaveCategory}
                    onRequestDelete={handleRequestDelete}
                    onToggleStatus={onToggleCategoryStatus}
                    currentUser={currentUser}
                />
            ) : (
                <CategoryManagementPage
                    title={`Quản lý ${cat.title}`}
                    categoryKey={cat.key}
                    items={allData[cat.key as keyof typeof mockData]}
                    columns={getColumnsForCategory(cat.key, allData)}
                    FormComponent={cat.Component}
                    formProps={cat.props(allData)}
                    onSave={onSaveCategory}
                    onRequestDelete={handleRequestDelete}
                    onToggleStatus={onToggleCategoryStatus}
                    currentUser={currentUser}
                />
            )
        )
    })), [categories, allData, onSaveCategory, onToggleCategoryStatus, currentUser]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            
            <Tabs 
                tabs={tabs}
                activeTabIndex={activeTab}
                onTabChange={setActiveTab}
            />

            {itemToDelete && (
                <UsageConfirmationDialog
                    isOpen={!!itemToDelete}
                    onClose={handleCloseDialog}
                    onConfirmDelete={handleConfirmDelete}
                    onConfirmDisable={handleConfirmDisable}
                    isInUse={isItemInUse}
                    itemName={itemToDelete.item.ten}
                    itemType={translate(itemToDelete.categoryKey as string)}
                />
            )}
        </div>
    );
};