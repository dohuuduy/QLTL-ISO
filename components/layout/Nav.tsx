import React, { useState } from 'react';
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

  const filterMenu = (menu: MenuItem[]): MenuItem[] => {
    return menu.reduce((acc: MenuItem[], item) => {
      if (item.roles && !item.roles.some(role => currentUserRoles.includes(role))) {
        return acc;
      }

      if (item.type === 'divider') {
        if (!normalizedSearchTerm) { // Only show dividers when not searching
           acc.push(item);
        }
        return acc;
      }

      const itemAsNavItem = item as NavItemType; // Cast to NavItemType

      if (normalizedSearchTerm) {
        const children = itemAsNavItem.children ? filterMenu(itemAsNavItem.children) as NavItemType[] : [];
        const normalizedLabel = normalizeString(itemAsNavItem.label);

        if (normalizedLabel.includes(normalizedSearchTerm) || children.length > 0) {
          acc.push({ ...itemAsNavItem, children });
        }
      } else {
        if (itemAsNavItem.children) {
          acc.push({ ...itemAsNavItem, children: filterMenu(itemAsNavItem.children) as NavItemType[] });
        } else {
          acc.push(itemAsNavItem);
        }
      }
      return acc;
    }, []);
  };

  const filteredMenu = filterMenu(menuConfig);

  const searchInput = (
    <div className="relative p-2">
        <Icon type="search" className="search-input-icon h-5 w-5" />
        <input
            type="text"
            placeholder="Tìm kiếm..."
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    </div>
  );

  return (
    <nav className="flex flex-col h-full">
      {!isCollapsed && searchInput}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {filteredMenu.map((item, index) => {
            if (item.type === 'divider') {
                if (isCollapsed) return null;
                return (
                    <div key={index} className="pt-4 pb-2 px-2">
                        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">{item.label}</p>
                    </div>
                );
            }
            return (
              <NavItem 
                key={(item as NavItemType).view} 
                item={item as NavItemType} 
                isCollapsed={isCollapsed} 
                onNavigate={onNavigate} 
                currentView={currentView} 
              />
            )
        })}
      </div>
    </nav>
  );
};
