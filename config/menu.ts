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
       { label: 'Tổ chức & Nhân sự', view: 'settings-group-org', icon: 'building-library' },
       { label: 'Cấu hình Tài liệu', view: 'settings-group-doc', icon: 'document-text' },
       { label: 'Tiêu chuẩn & Đánh giá', view: 'settings-group-audit', icon: 'bookmark' },
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
