import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from '../ui/Icon';
import type { NavItem as NavItemType } from '../../types/menu';

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
  onNavigate: (view: string) => void;
  currentView: string;
  depth?: number;
  openFlyoutView: string | null;
  toggleFlyoutView: (view: string) => void;
}

export const NavItem = React.memo(({ item, isCollapsed, onNavigate, currentView, depth = 0, openFlyoutView, toggleFlyoutView }: NavItemProps) => {
  const isActive = useMemo(() => {
    const checkActive = (currentItem: NavItemType): boolean => {
      if (currentItem.view === currentView) return true;
      if (currentItem.view === 'categories' && currentView.startsWith('settings-group-')) {
          return true;
      }
      if (currentItem.children) {
        return currentItem.children.some(child => checkActive(child as NavItemType));
      }
      return false;
    };
    return checkActive(item);
  }, [currentView, item]);

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(isActive);
  const submenuRef = useRef<HTMLUListElement>(null);
  const navItemRef = useRef<HTMLButtonElement>(null);
  const [flyoutStyle, setFlyoutStyle] = useState<React.CSSProperties>({});

  // Xử lý accordion cho sidebar mở rộng
  useEffect(() => {
    if (!isCollapsed) {
        setIsSubmenuOpen(isActive);
    }
  }, [isActive, isCollapsed]);
  
  const isFlyoutOpen = openFlyoutView === item.view;
  
  // Tính toán và cập nhật vị trí cho flyout
  useEffect(() => {
    const updatePosition = () => {
        if (isCollapsed && isFlyoutOpen && navItemRef.current) {
            const rect = navItemRef.current.getBoundingClientRect();
            setFlyoutStyle({
                position: 'fixed',
                top: rect.top,
                left: rect.right + 8, // 8px = ml-2
                zIndex: 100 // a high z-index
            });
        }
    };
    
    if (isFlyoutOpen) {
        updatePosition(); // Đặt vị trí ban đầu
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true); // Bắt sự kiện cuộn
    }

    // Dọn dẹp event listeners
    return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isCollapsed, isFlyoutOpen]);


  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCollapsed) {
      if (item.children) {
        toggleFlyoutView(item.view);
      } else if (item.view) {
        onNavigate(item.view);
      }
    } else {
      if (item.children) {
        setIsSubmenuOpen(prev => !prev);
      } else if (item.view) {
        onNavigate(item.view);
      }
    }
  };

  const NavIcon = item.icon ? Icon : () => null;
  const navItemClasses = `group flex items-center p-2 text-sm font-medium rounded-md cursor-pointer transition-colors w-full ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;
  
  // Chế độ thu gọn
  if (isCollapsed) {
    return (
      <>
        <button
          ref={navItemRef}
          title={item.label}
          onClick={handleItemClick}
          className={`${navItemClasses} justify-center w-12 h-12`}
          aria-haspopup={!!item.children}
          aria-expanded={isFlyoutOpen}
        >
          <NavIcon type={item.icon} className="h-6 w-6" />
        </button>

        {item.children && isFlyoutOpen && ReactDOM.createPortal(
          <div
            style={flyoutStyle}
            className="w-60 rounded-md bg-slate-800 p-2 shadow-lg ring-1 ring-black ring-opacity-5"
            onClick={(e) => e.stopPropagation()} // Ngăn việc click vào menu con làm đóng nó
          >
            <div className="text-sm font-semibold text-white px-2 py-1 mb-1">{item.label}</div>
            <ul className="space-y-1">
              {item.children.map(child => (
                <li key={child.view}>
                  <NavItem 
                    item={child}
                    isCollapsed={false} // Item con trong flyout luôn ở dạng mở rộng
                    onNavigate={onNavigate}
                    currentView={currentView}
                    depth={0}
                    openFlyoutView={openFlyoutView}
                    toggleFlyoutView={toggleFlyoutView}
                  />
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
      </>
    );
  }

  // Chế độ mở rộng
  const iconClasses = `h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`;
  const paddingLeft = `${0.5 + depth * 1.25}rem`;

  return (
    <>
      <button 
        onClick={handleItemClick} 
        className={navItemClasses} 
        style={{ paddingLeft }}
        aria-haspopup={!!item.children}
        aria-expanded={isSubmenuOpen}
      >
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
                  openFlyoutView={openFlyoutView}
                  toggleFlyoutView={toggleFlyoutView}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
});