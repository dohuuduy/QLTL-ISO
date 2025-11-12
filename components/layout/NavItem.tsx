import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '../ui/Icon';
import type { NavItem as NavItemType } from '../../types/menu';

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
  onNavigate: (view: string) => void;
  currentView: string;
  depth?: number;
}

export const NavItem = React.memo(({ item, isCollapsed, onNavigate, currentView, depth = 0 }: NavItemProps) => {
  const isActive = useMemo(() => {
    const checkActive = (currentItem: NavItemType): boolean => {
      if (currentItem.view === currentView) return true;
      // Special check for category group pages
      if (currentItem.view === 'categories' && currentView.startsWith('settings-group-')) {
          return true;
      }
      if (currentItem.children) {
        return currentItem.children.some(child => checkActive(child));
      }
      return false;
    };
    return checkActive(item);
  }, [currentView, item]);

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(isActive);
  const submenuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Keep submenu open if it's active, otherwise close it when collapsing the main sidebar
    if (isCollapsed) {
        setIsSubmenuOpen(false);
    } else {
        setIsSubmenuOpen(isActive);
    }
  }, [isActive, isCollapsed]);

  const NavIcon = item.icon ? Icon : () => null;

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.children && !isCollapsed) {
      setIsSubmenuOpen(prev => !prev);
    } else {
      onNavigate(item.view);
    }
  };

  const navItemClasses = `group flex items-center p-2 text-sm font-medium rounded-md cursor-pointer transition-colors w-full
    ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;
  
  const iconClasses = `h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`;

  // Collapsed View
  if (isCollapsed) {
    return (
        <button
          title={item.label}
          onClick={handleItemClick}
          className={`${navItemClasses} justify-center w-12 h-12`}
        >
          <NavIcon type={item.icon} className="h-6 w-6" />
        </button>
    );
  }

  const paddingLeft = `${0.5 + depth * 1.25}rem`; // 0.5rem base padding for depth 0

  return (
    <>
      <button onClick={handleItemClick} className={navItemClasses} style={{ paddingLeft }}>
        {item.icon && <NavIcon type={item.icon} className={iconClasses} />}
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.children && (
          <Icon type="chevron-down" className={`h-4 w-4 transform transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      {item.children && (
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: isSubmenuOpen ? `${submenuRef.current?.scrollHeight}px` : '0px' }}
        >
          <ul ref={submenuRef} className="space-y-1 py-1">
            {item.children.map(child => (
              <li key={child.view}>
                <NavItem
                  item={child}
                  isCollapsed={isCollapsed}
                  onNavigate={onNavigate}
                  currentView={currentView}
                  depth={depth + 1}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
});