import React, { useState, useMemo } from 'react';
import { NavItem } from './NavItem';
import { menuConfig } from '../../config/menu';
import { Icon } from '../ui/Icon';
import type { MenuItem, NavItem as NavItemType } from '../../types/menu';

interface NavProps {
  isCollapsed: boolean;
  currentUserRoles: string[];
  onNavigate: (view: string) => void;
  currentView: string;
}

const normalizeString = (str: string) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export const Nav = ({ isCollapsed, currentUserRoles, onNavigate, currentView }: NavProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = normalizeString(searchTerm);

  const filteredMenu = useMemo(() => {
    // Hàm đệ quy để lọc menu dựa trên quyền và từ khóa tìm kiếm
    const filterMenu = (menu: MenuItem[]): MenuItem[] => {
      return menu.reduce((acc: MenuItem[], item) => {
        // Kiểm tra quyền của người dùng. Nếu item yêu cầu vai trò cụ thể,
        // người dùng phải có ít nhất một trong các vai trò đó.
        if (item.roles && !item.roles.some(role => currentUserRoles.includes(role))) {
          return acc; // Bỏ qua item này nếu không có quyền
        }

        if (item.type === 'divider') {
          if (!normalizedSearchTerm) { // Chỉ hiển thị dải phân cách khi không tìm kiếm
             acc.push(item);
          }
          return acc;
        }

        const itemAsNavItem = item as NavItemType;

        if (normalizedSearchTerm) {
          const children = itemAsNavItem.children ? filterMenu(itemAsNavItem.children) as NavItemType[] : [];
          const normalizedLabel = normalizeString(itemAsNavItem.label);

          // Hiển thị item nếu tên của nó hoặc tên của con nó khớp với từ khóa
          if (normalizedLabel.includes(normalizedSearchTerm) || children.length > 0) {
            acc.push({ ...itemAsNavItem, children });
          }
        } else {
          // Nếu không tìm kiếm, xử lý đệ quy cho các mục con
          if (itemAsNavItem.children) {
            acc.push({ ...itemAsNavItem, children: filterMenu(itemAsNavItem.children) as NavItemType[] });
          } else {
            acc.push(itemAsNavItem);
          }
        }
        return acc;
      }, []);
    };

    return filterMenu(menuConfig);
  }, [searchTerm, currentUserRoles, menuConfig]);


  const searchInput = (
    <div className="relative p-2">
        <Icon type="search" className="search-input-icon h-5 w-5 !text-slate-400" />
        <input
            type="text"
            placeholder="Tìm kiếm..."
            className="form-input search-input bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
            <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="search-input-clear-btn !text-slate-400 hover:!text-slate-200"
                title="Xóa"
            >
                <Icon type="x-mark" className="h-5 w-5" />
            </button>
        )}
    </div>
  );

  return (
    <nav className="flex flex-col h-full">
      {!isCollapsed && searchInput}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredMenu.length > 0 ? filteredMenu.map((item, index) => {
            if (item.type === 'divider') {
                if (isCollapsed) return null;
                return (
                    <div key={index} className="pt-4 pb-2 px-2">
                        <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">{item.label}</p>
                    </div>
                );
            }
            return (
              <NavItem 
                key={(item as NavItemType).view || index} 
                item={item as NavItemType} 
                isCollapsed={isCollapsed} 
                onNavigate={onNavigate} 
                currentView={currentView} 
              />
            )
        }) : (
            !isCollapsed && <p className="p-2 text-sm text-slate-400 text-center">Không có kết quả.</p>
        )}
      </div>
    </nav>
  );
};