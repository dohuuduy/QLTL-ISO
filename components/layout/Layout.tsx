

import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import type { NhanSu, ThongBao, ReportType, ChucVu } from '../../types';

interface LayoutProps {
    children: React.ReactNode;
    currentUser: NhanSu;
    onLogout: () => void;
    onNavigate: (view: any) => void;
    notifications: ThongBao[];
    onMarkNotificationRead: (id: string) => void;
    onMarkAllNotificationsRead: () => void;
    onNavigateToDocument: (docId: string) => void;
    currentView: string;
    onNavigateToReport: (reportType: ReportType) => void;
    chucVuList: ChucVu[];
}

const Layout: React.FC<LayoutProps> = ({ 
    children, currentUser, onLogout, onNavigate, 
    notifications, onMarkNotificationRead, onMarkAllNotificationsRead, onNavigateToDocument,
    currentView, onNavigateToReport, chucVuList
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileMenuOpen}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
                onNavigate={onNavigate}
                currentUser={currentUser}
                currentView={currentView}
                onNavigateToReport={onNavigateToReport}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar
                    onLogoClick={() => onNavigate('dashboard')}
                    onToggleSidebar={toggleSidebar}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleMobileMenu={toggleMobileMenu}
                    currentUser={currentUser}
                    onLogout={onLogout}
                    notifications={notifications}
                    onMarkNotificationRead={onMarkNotificationRead}
                    onMarkAllNotificationsRead={onMarkAllNotificationsRead}
                    onNavigateToDocument={onNavigateToDocument}
                    chucVuList={chucVuList}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;