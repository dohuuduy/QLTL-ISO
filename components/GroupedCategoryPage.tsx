
import React, { useState, useEffect, useMemo } from 'react';
import Tabs from './ui/Tabs';
import CategoryManagementPage from './CategoryManagementPage';
import StandardsManagementPage from './StandardsManagementPage';

// Forms
import PersonnelForm from './forms/PersonnelForm';
import DepartmentForm from './forms/DepartmentForm';
import GenericCategoryForm from './forms/GenericCategoryForm';
import AuditorForm from './forms/AuditorForm';

import type { NhanSu } from '../types';
import { mockData } from '../data/mockData';

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

const getColumnsForCategory = (key: string, data: any) => {
    switch (key) {
        case 'nhanSu':
            const phongBanMap = new Map(data.phongBan.map((p: any) => [p.id, p.ten]));
            const chucVuMap = new Map(data.chucVu.map((c: any) => [c.id, c.ten]));
            return [
                { header: 'Tên nhân sự', accessor: 'ten', sortKey: 'ten', width: '25%' },
                { header: 'Email', accessor: 'email', sortKey: 'email', width: '20%' },
                { header: 'Tên đăng nhập', accessor: 'ten_dang_nhap', sortKey: 'ten_dang_nhap', width: '15%' },
                { header: 'Phòng ban', accessor: (item: any) => phongBanMap.get(item.phong_ban_id) || '', sortKey: 'phong_ban_id', width: '20%' },
                { header: 'Chức vụ', accessor: (item: any) => chucVuMap.get(item.chuc_vu) || '', sortKey: 'chuc_vu', width: '15%' },
            ];
        case 'danhGiaVien':
            const orgMap = new Map(data.toChucDanhGia.map((o: any) => [o.id, o.ten]));
            return [
                 { header: 'Tên đánh giá viên', accessor: 'ten', sortKey: 'ten', width: '40%' },
                 { header: 'Loại', accessor: (item: any) => item.loai === 'internal' ? 'Nội bộ' : 'Bên ngoài', sortKey: 'loai', width: '25%' },
                 { header: 'Tổ chức', accessor: (item: any) => orgMap.get(item.to_chuc_id) || '', sortKey: 'to_chuc_id', width: '30%' },
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

    const tabs = useMemo(() => categories.map(cat => ({
        title: cat.title,
        content: (
            cat.key === 'tieuChuan' ? (
                <StandardsManagementPage 
                    standards={allData.tieuChuan}
                    onUpdateData={onUpdateData}
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
                    onDelete={onDeleteCategory}
                    onToggleStatus={onToggleCategoryStatus}
                    currentUser={currentUser}
                />
            )
        )
    })), [categories, allData, onSaveCategory, onDeleteCategory, onToggleCategoryStatus, onUpdateData, currentUser]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            
            <Tabs 
                tabs={tabs}
                activeTabIndex={activeTab}
                onTabChange={setActiveTab}
            />
        </div>
    );
};
