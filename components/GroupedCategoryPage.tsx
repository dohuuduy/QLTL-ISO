import React, { useState, useEffect } from 'react';
import Tabs from './ui/Tabs';
import CategoryManagementPage from './CategoryManagementPage';
import StandardsManagementPage from './StandardsManagementPage';

// Forms
import PersonnelForm from './forms/PersonnelForm';
import DepartmentForm from './forms/DepartmentForm';
import GenericCategoryForm from './forms/GenericCategoryForm';
import AuditorForm from './forms/AuditorForm';

// Types
import type { DanhMucChung, NhanSu } from '../types';
import { mockData } from '../data/mockData';
import Badge from './ui/Badge';

type CategoryKey = keyof typeof mockData;

interface GroupedCategoryPageProps {
    group: 'org' | 'doc' | 'audit';
    title: string;
    allData: typeof mockData;
    onSaveCategory: (categoryKey: CategoryKey, item: any) => void;
    onDeleteCategory: (categoryKey: CategoryKey, item: any) => void;
    onToggleCategoryStatus: (categoryKey: CategoryKey, item: any) => void;
    onUpdateData: React.Dispatch<React.SetStateAction<any>>;
    currentUser: NhanSu;
    initialTab?: string;
}

const categoryGroups = {
    org: [
        { key: 'nhanSu', title: 'Nhân sự', Component: CategoryManagementPage, FormComponent: PersonnelForm, formProps: (allData: any, currentUser: NhanSu) => ({ phongBanList: allData.phongBan, chucVuList: allData.chucVu, currentUser }), columns: (allData: any) => ([
            { header: 'Tên nhân sự', label: 'Tên nhân sự', accessor: 'ten', sortKey: 'ten' },
            { header: 'Tên đăng nhập', label: 'Tên đăng nhập', accessor: 'ten_dang_nhap', sortKey: 'ten_dang_nhap' },
            { header: 'Chức vụ', label: 'Chức vụ', accessor: (item: NhanSu) => allData.chucVu.find((cv: any) => cv.id === item.chuc_vu)?.ten || '', sortKey: 'chuc_vu' },
            { header: 'Phòng ban', label: 'Phòng ban', accessor: (item: NhanSu) => allData.phongBan.find((pb: any) => pb.id === item.phong_ban_id)?.ten || '', sortKey: 'phong_ban_id' },
            { header: 'Vai trò', label: 'Vai trò', accessor: (item: NhanSu) => <Badge status={item.role} />, sortKey: 'role' },
        ])},
        { key: 'phongBan', title: 'Phòng ban', Component: CategoryManagementPage, FormComponent: DepartmentForm },
        { key: 'chucVu', title: 'Chức vụ', Component: CategoryManagementPage, FormComponent: GenericCategoryForm, formProps: { categoryName: 'Chức vụ' }},
    ],
    doc: [
        { key: 'loaiTaiLieu', title: 'Loại tài liệu', Component: CategoryManagementPage, FormComponent: GenericCategoryForm, formProps: { categoryName: 'Loại tài liệu' } },
        { key: 'capDoTaiLieu', title: 'Cấp độ tài liệu', Component: CategoryManagementPage, FormComponent: GenericCategoryForm, formProps: { categoryName: 'Cấp độ tài liệu' } },
        { key: 'mucDoBaoMat', title: 'Mức độ bảo mật', Component: CategoryManagementPage, FormComponent: GenericCategoryForm, formProps: { categoryName: 'Mức độ bảo mật' } },
        { key: 'tanSuatRaSoat', title: 'Tần suất rà soát', Component: CategoryManagementPage, FormComponent: GenericCategoryForm, formProps: { categoryName: 'Tần suất rà soát' } },
        { key: 'hangMucThayDoi', title: 'Hạng mục thay đổi', Component: CategoryManagementPage, FormComponent: GenericCategoryForm, formProps: { categoryName: 'Hạng mục thay đổi' } },
    ],
    audit: [
        { key: 'tieuChuan', title: 'Tiêu chuẩn', Component: StandardsManagementPage },
        { key: 'danhGiaVien', title: 'Đánh giá viên', Component: CategoryManagementPage, FormComponent: AuditorForm, formProps: (allData: any) => ({ organizations: allData.toChucDanhGia }) },
        { key: 'toChucDanhGia', title: 'Tổ chức đánh giá', Component: CategoryManagementPage, FormComponent: GenericCategoryForm, formProps: { categoryName: 'Tổ chức đánh giá' } },
    ]
};

const GroupedCategoryPage: React.FC<GroupedCategoryPageProps> = ({ 
    group, 
    title,
    allData,
    onSaveCategory,
    onDeleteCategory,
    onToggleCategoryStatus,
    onUpdateData,
    currentUser,
    initialTab
}) => {
    
    const tabsConfig = categoryGroups[group];

    const findInitialIndex = () => {
        if (!initialTab) return 0;
        const index = tabsConfig.findIndex(tab => tab.key === initialTab);
        return index > -1 ? index : 0;
    };

    const [activeTabIndex, setActiveTabIndex] = useState(findInitialIndex());
    
    useEffect(() => {
        setActiveTabIndex(findInitialIndex());
    }, [initialTab, group]);


    const tabs = tabsConfig.map(config => {
        const { key, title, FormComponent, formProps, columns } = config;

        let content;
        if (key === 'tieuChuan') { // Special case for Standards
            content = (
                <StandardsManagementPage
                    standards={allData.tieuChuan}
                    onUpdateData={onUpdateData}
                    currentUser={currentUser}
                />
            );
        } else {
             const finalFormProps = typeof formProps === 'function' ? formProps(allData, currentUser) : formProps;
             const finalColumns = typeof columns === 'function' ? columns(allData) : columns;

            content = (
                <CategoryManagementPage<DanhMucChung>
                    title={title}
                    categoryKey={key as CategoryKey}
                    items={allData[key as CategoryKey] as any[]}
                    columns={finalColumns}
                    FormComponent={FormComponent!}
                    formProps={finalFormProps}
                    onSave={onSaveCategory}
                    onDelete={onDeleteCategory}
                    onToggleStatus={onToggleCategoryStatus}
                    currentUser={currentUser}
                />
            );
        }
        
        return {
            title: title,
            content: <div className="mt-6">{content}</div>
        };
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <Tabs tabs={tabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} />
        </div>
    );
};

export default GroupedCategoryPage;