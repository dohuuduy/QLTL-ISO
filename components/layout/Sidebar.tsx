import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import type { NhanSu, ReportType } from '../../types';
import { reportNavItems } from '../../constants';

interface NavItemProps {
    icon: string;
    label: string;
    isCollapsed: boolean;
    isActive?: boolean;
    onClick: () => void;
    fontWeight?: 'font-medium' | 'font-semibold';
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isCollapsed, isActive, onClick, fontWeight = 'font-medium' }) => (
    <button
        onClick={onClick}
        className={`group flex items-center w-full py-3 text-sm ${fontWeight} rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-3 pr-2'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 pl-4 pr-2'
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
    onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed, isMobileOpen, onCloseMobileMenu, onNavigate, currentUser, currentView, onNavigateToReport, onToggleSidebar
}) => {
    
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(currentView.startsWith('settings-'));

    const mainNavItems = [
        { view: 'dashboard', icon: 'home', label: 'Dashboard' },
        { view: 'documents', icon: 'document-text', label: 'Quản lý tài liệu' },
        { view: 'standards', icon: 'bookmark', label: 'Quản lý tiêu chuẩn' },
        { view: 'audits', icon: 'calendar', label: 'Lịch audit' },
        { view: 'reports', icon: 'chart-bar', label: 'Báo cáo & thống kê' },
    ];
    
     const adminNavItems = [
        { view: 'audit-log', icon: 'clock', label: 'Nhật ký hệ thống' },
    ];
    
    const categoryNavItems = [
        { key: 'settings-personnel', label: 'Nhân sự' },
        { key: 'settings-departments', label: 'Phòng ban' },
        { key: 'settings-positions', label: 'Chức vụ' },
        { key: 'settings-docTypes', label: 'Loại tài liệu' },
        { key: 'settings-docLevels', label: 'Cấp độ tài liệu' },
        { key: 'settings-securityLevels', label: 'Mức độ bảo mật' },
        { key: 'settings-reviewFrequencies', label: 'Tần suất rà soát' },
        { key: 'settings-changeItems', label: 'Hạng mục thay đổi' },
        { key: 'settings-auditors', label: 'Đánh giá viên' },
        { key: 'settings-auditOrgs', label: 'Tổ chức đánh giá' },
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
    const isCategoriesActive = currentView.startsWith('settings-');

    const sidebarContent = (
         <div className="flex flex-col h-full">
            {/* Mobile Header: Logo and Title inside sidebar */}
            <div className="md:hidden flex-shrink-0 px-4 flex items-center border-b border-gray-200 h-16">
                 <button onClick={() => handleNavigation('dashboard')} className="flex items-center space-x-3">
                    <Icon type="document-duplicate" className="h-8 w-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-800">DocManager ISO</span>
                </button>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 pt-4 space-y-1">
                    {mainNavItems.map(item => {
                        if (item.view === 'reports') {
                            return (
                                <div key={item.view}>
                                    <NavItem
                                        icon={item.icon}
                                        label={item.label}
                                        isCollapsed={isCollapsed}
                                        isActive={isReportsActive}
                                        onClick={() => handleNavigation(item.view)}
                                        fontWeight="font-semibold"
                                    />
                                    {isReportsActive && !isCollapsed && (
                                        <div className="pl-8 pt-1 space-y-1">
                                            {reportNavItems.map(subItem => (
                                                <button 
                                                    key={subItem.key}
                                                    onClick={() => handleReportNavigation(subItem.key)}
                                                    className="flex items-center w-full pl-4 pr-2 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900"
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
                                fontWeight="font-semibold"
                            />
                        )
                    })}
                    
                     {currentUser.role === 'admin' && (
                         <>
                            <div className="pl-4 pr-2 pt-4 pb-2">
                                <span className={`text-sm font-semibold text-gray-500 uppercase ${isCollapsed ? 'hidden' : 'block'}`}>
                                    Quản trị
                                </span>
                            </div>
                            
                            {adminNavItems.map(item => (
                                <NavItem
                                    key={item.view}
                                    icon={item.icon}
                                    label={item.label}
                                    isCollapsed={isCollapsed}
                                    isActive={currentView === item.view}
                                    onClick={() => handleNavigation(item.view)}
                                />
                            ))}
                         
                             <div>
                                <button
                                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                    className={`group flex items-center w-full py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        isCategoriesActive
                                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-3 pr-2'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 pl-4 pr-2'
                                    }`}
                                >
                                    <Icon
                                        type="archive"
                                        className={`h-6 w-6 transition-colors duration-200 ${
                                            isCategoriesActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    />
                                    <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                                        Danh mục
                                    </span>
                                    {!isCollapsed && (
                                        <Icon
                                            type="chevron-down"
                                            className={`ml-auto h-5 w-5 transform transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}
                                        />
                                    )}
                                </button>
                                {isCategoriesOpen && !isCollapsed && (
                                    <div className="pl-8 pt-1 space-y-1">
                                        {categoryNavItems.map(item => (
                                            <button 
                                                key={item.key}
                                                onClick={() => handleNavigation(item.key)}
                                                className={`flex items-center w-full pl-4 pr-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 hover:text-gray-900 ${
                                                    currentView === item.key ? 'text-blue-600' : 'text-gray-500'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>
                {/* Settings link at the bottom */}
                <div className="mt-auto pb-4">
                    <NavItem
                        icon="cog"
                        label="Cài đặt"
                        isCollapsed={isCollapsed}
                        isActive={currentView === 'settings'}
                        onClick={() => handleNavigation('settings')}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-30 flex md:hidden no-print" role="dialog" aria-modal="true">
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
            <div className={`hidden md:flex md:flex-shrink-0 relative bg-white border-r border-slate-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} no-print`}>
                {sidebarContent}
                 <button
                    onClick={onToggleSidebar}
                    className="absolute top-20 -right-3 z-20 h-6 w-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                >
                    <Icon
                        type="chevron-double-left"
                        className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>
        </>
    );
};

export default Sidebar;