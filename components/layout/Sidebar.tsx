import React from 'react';
import { Icon } from '../ui/Icon';
import type { NhanSu, ReportType } from '../../types';
import { reportNavItems } from '../../constants';

interface NavItemProps {
    icon: string;
    label: string;
    isCollapsed: boolean;
    isActive?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isCollapsed, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        <Icon
            type={icon}
            className={`h-6 w-6 transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
            }`}
        />
        <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            {label}
        </span>
    </button>
);

interface SidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onCloseMobileMenu: () => void;
    onNavigate: (view: any) => void;
    currentUser: NhanSu;
    currentView: string;
    onNavigateToReport: (reportType: ReportType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed, isMobileOpen, onCloseMobileMenu, onNavigate, currentUser, currentView, onNavigateToReport
}) => {
    
    const mainNavItems = [
        { view: 'dashboard', icon: 'home', label: 'Dashboard' },
        { view: 'documents', icon: 'document-text', label: 'Quản lý Tài liệu' },
        { view: 'standards', icon: 'bookmark', label: 'Quản lý Tiêu chuẩn' },
        { view: 'audits', icon: 'calendar', label: 'Lịch Audit' },
        { view: 'reports', icon: 'chart-bar', label: 'Báo cáo' },
        { view: 'settings', icon: 'cog', label: 'Cài đặt', adminOnly: true },
    ];

    const handleNavigation = (view: any) => {
        onNavigate(view);
        onCloseMobileMenu();
    }
    
    const handleReportNavigation = (reportType: ReportType) => {
        onNavigateToReport(reportType);
        onCloseMobileMenu();
    };
    
    const isReportsActive = currentView === 'reports';

    const sidebarContent = (
         <div className="flex flex-col h-full">
            {/* Mobile Header: Logo and Title inside sidebar */}
            <div className="md:hidden flex-shrink-0 px-4 flex items-center border-b border-gray-200 h-16">
                 <button onClick={() => handleNavigation('dashboard')} className="flex items-center space-x-3">
                    <Icon type="document-duplicate" className="h-8 w-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-800">DocManager ISO</span>
                </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
                 {mainNavItems.map(item => {
                    if (item.adminOnly && currentUser.role !== 'admin') return null;

                    if (item.view === 'reports') {
                        return (
                            <div key={item.view}>
                                <NavItem
                                    icon={item.icon}
                                    label={item.label}
                                    isCollapsed={isCollapsed}
                                    isActive={isReportsActive}
                                    onClick={() => handleNavigation(item.view)}
                                />
                                {isReportsActive && !isCollapsed && (
                                     <div className="pl-8 pt-1 space-y-1">
                                        {reportNavItems.map(subItem => (
                                            <button 
                                                key={subItem.key}
                                                onClick={() => handleReportNavigation(subItem.key)}
                                                className="flex items-center w-full px-4 py-2 text-xs font-medium text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900"
                                            >
                                                {subItem.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavItem
                            key={item.view}
                            icon={item.icon}
                            label={item.label}
                            isCollapsed={isCollapsed}
                            isActive={currentView === item.view}
                            onClick={() => handleNavigation(item.view)}
                        />
                    )
                 })}
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-30 flex md:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={onCloseMobileMenu}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                         <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={onCloseMobileMenu}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <Icon type="x-mark" className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        {React.cloneElement(sidebarContent, { isCollapsed: false })}
                    </div>
                    <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className={`hidden md:flex md:flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {sidebarContent}
            </div>
        </>
    );
};

export default Sidebar;