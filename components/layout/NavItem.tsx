import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '../ui/Icon';
import type { NavItem as NavItemType } from '../../types/menu';

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const NavItem = React.memo(({ item, isCollapsed, onNavigate, currentView }: NavItemProps) => {
  const isActive = useMemo(() => {
    const checkActive = (currentItem: NavItemType): boolean => {
      if (currentItem.view === currentView) return true;
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
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed) {
        setIsSubmenuOpen(isActive);
    }
  }, [isActive, isCollapsed]);

  const NavIcon = item.icon ? Icon : () => null;

  const handleNavigate = (e: React.MouseEvent, view: string) => {
    e.stopPropagation();
    onNavigate(view);
  };
  
  const handleToggleSubmenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCollapsed) {
        setIsSubmenuOpen(prev => !prev);
    }
  };

  const navItemClasses = `group flex items-center p-2 text-sm font-medium rounded-md cursor-pointer transition-colors w-full
    ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;

  // Collapsed View
  if (isCollapsed) {
    return (
        <button
          title={item.label}
          onClick={(e) => handleNavigate(e, item.view)} // Children are ignored when collapsed. Navigate to parent.
          className={`${navItemClasses} justify-center w-12 h-12`}
        >
          <NavIcon type={item.icon} className={`h-6 w-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
        </button>
    );
  }

  // Expanded View with Children (Accordion)
  if (item.children) {
    return (
      <div>
        <button onClick={handleToggleSubmenu} className={navItemClasses}>
          <NavIcon type={item.icon} className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
          <span className="flex-1 text-left truncate">{item.label}</span>
          <Icon type="chevron-down" className={`h-4 w-4 transform transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} />
        </button>
        <div
          ref={submenuRef}
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: isSubmenuOpen ? `${submenuRef.current?.scrollHeight}px` : '0px' }}
        >
          <div className="mt-1 pl-6 space-y-1 py-1">
            {item.children.map(child => (
              <NavItem key={child.view} item={child} isCollapsed={isCollapsed} onNavigate={onNavigate} currentView={currentView} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Expanded View without Children (Simple Link)
  return (
    <button onClick={(e) => handleNavigate(e, item.view)} className={navItemClasses}>
      <NavIcon type={item.icon} className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      <span className="flex-1 text-left truncate">{item.label}</span>
      {item.badge && (
        <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium bg-slate-600 text-slate-200 rounded-full">{item.badge}</span>
      )}
    </button>
  );
});
