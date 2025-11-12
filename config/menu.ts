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
    view: 'reports', // Parent view for accordion
    icon: 'chart-bar',
    children: [
      {
        type: 'item',
        label: 'Báo cáo chung',
        view: 'reports', // Main reports page
        icon: 'chart-bar',
      },
      {
        type: 'item',
        label: 'Báo cáo chi tiết',
        view: 'reports-detailed', // A dummy parent for level 3
        icon: 'document-text',
        children: [
           {
            type: 'item',
            label: 'Theo nhân viên',
            view: 'report-by-employee', // Level 3 item
            icon: 'user-circle',
          },
        ]
      }
    ]
  },
  {
    type: 'divider',
    label: 'QUẢN TRỊ',
    // Chỉ những người dùng có vai trò 'admin' mới thấy được mục này và các mục con bên dưới.
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
    roles: ['admin'], // Chỉ admin mới thấy mục Danh mục
    children: [
       // Mục "Nhân sự" nằm trong group này, và sẽ được ẩn cùng với cha của nó.
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
