import type { MenuItem } from '../types/menu';

export const menuConfig: MenuItem[] = [
  {
    type: 'item',
    label: 'Dashboard',
    view: 'dashboard',
    icon: 'home',
  },
  {
    type: 'item',
    label: 'Quản lý tài liệu',
    view: 'documents',
    icon: 'clipboard-document-list',
  },
  {
    type: 'item',
    label: 'Quản lý tiêu chuẩn',
    view: 'standards',
    icon: 'bookmark',
  },
  {
    type: 'item',
    label: 'Lịch audit',
    view: 'audits',
    icon: 'calendar',
  },
  {
    type: 'item',
    label: 'Báo cáo & thống kê',
    view: 'reports',
    icon: 'chart-bar',
  },
  {
    type: 'divider',
    label: 'QUẢN TRỊ',
    roles: ['admin'],
  },
  {
    type: 'item',
    label: 'Nhật ký hệ thống',
    view: 'audit-log',
    icon: 'document-text',
    roles: ['admin'],
  },
  {
    type: 'item',
    label: 'Danh mục',
    view: 'categories', // Dummy view for parent accordion
    icon: 'clipboard-document-list',
    roles: ['admin'],
    children: [
       { label: 'Nhân sự', view: 'settings-personnel', icon: 'document-text' },
       { label: 'Phòng ban', view: 'settings-departments', icon: 'building-library' },
       { label: 'Chức vụ', view: 'settings-positions', icon: 'document-text' },
       { label: 'Loại tài liệu', view: 'settings-docTypes', icon: 'document-text' },
       { label: 'Cấp độ tài liệu', view: 'settings-docLevels', icon: 'document-text' },
       { label: 'Mức độ bảo mật', view: 'settings-securityLevels', icon: 'lock-closed' },
       { label: 'Tần suất rà soát', view: 'settings-reviewFrequencies', icon: 'document-text' },
       { label: 'Hạng mục thay đổi', view: 'settings-changeItems', icon: 'arrows-right-left' },
       { label: 'Đánh giá viên', view: 'settings-auditors', icon: 'document-text' },
       { label: 'Tổ chức đánh giá', view: 'settings-auditOrgs', icon: 'building-library' },
    ]
  },
   {
    type: 'item',
    label: 'Cài đặt',
    view: 'settings',
    icon: 'cog',
    roles: ['admin'],
  },
];
