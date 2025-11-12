import React from 'react';
import { Nav } from './Nav';
import { Icon } from '../ui/Icon';
import type { NhanSu } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobileMenu: () => void;
  onToggleSidebar: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  currentUser: NhanSu;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed,
    isMobileOpen,
    onCloseMobileMenu,
    onToggleSidebar,
    onNavigate,
    currentView,
    currentUser,
}) => {

  const navContent = (isMobile: boolean = false) => (
    <div className="flex h-full flex-col bg-slate-100/50">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 flex-shrink-0">
        <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 overflow-hidden min-w-0`}>
          <Icon type="document-duplicate" className="h-8 w-8 text-blue-600 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
              <span className="text-lg font-bold whitespace-nowrap text-slate-800 truncate">DocManager</span>
          )}
        </button>
        
        {/* Toggle button for desktop, always visible */}
        {!isMobile && (
          <button
            onClick={onToggleSidebar}
            aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            className="p-1 rounded-full hover:bg-slate-200"
          >
            <Icon
              type="chevron-double-left"
              className={`h-5 w-5 text-slate-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      
      <Nav
        isCollapsed={isCollapsed && !isMobile}
        currentUserRoles={[currentUser.role]}
        onNavigate={onNavigate}
        currentView={currentView}
      />
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMobileOpen ? 'bg-black bg-opacity-50' : 'bg-transparent pointer-events-none'}`}
        onClick={onCloseMobileMenu}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 md:hidden bg-white transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {navContent(true)}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:block h-screen z-20 flex-shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}>
        {navContent(false)}
      </aside>
    </>
  );
};

export default Sidebar;