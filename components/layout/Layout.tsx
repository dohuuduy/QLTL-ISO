import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import type { NhanSu, ThongBao, ReportType, ChucVu } from '../../types';
import { useSidebar } from '../../hooks/use-sidebar';
import type { BreadcrumbItem } from '../ui/Breadcrumb';

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
    breadcrumbs: BreadcrumbItem[];
}

const Layout: React.FC<LayoutProps> = ({ 
    children, currentUser, onLogout, onNavigate, 
    notifications, onMarkNotificationRead, onMarkAllNotificationsRead, onNavigateToDocument,
    currentView, onNavigateToReport, chucVuList, breadcrumbs
}) => {
    const { isCollapsed, isMobileOpen, setMobileOpen, toggleSidebar } = useSidebar();

    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileOpen]);

    // Close mobile menu on navigation
    useEffect(() => {
        if (isMobileOpen) {
            setMobileOpen(false);
        }
    }, [currentView, setMobileOpen]);


    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                onCloseMobileMenu={() => setMobileOpen(false)}
                onNavigate={onNavigate}
                currentUser={currentUser}
                currentView={currentView}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar
                    onToggleSidebar={toggleSidebar}
                    onToggleMobileMenu={() => setMobileOpen(true)}
                    currentUser={currentUser}
                    onLogout={onLogout}
                    notifications={notifications}
                    onMarkNotificationRead={onMarkNotificationRead}
                    onMarkAllNotificationsRead={onMarkAllNotificationsRead}
                    onNavigateToDocument={onNavigateToDocument}
                    chucVuList={chucVuList}
                    breadcrumbs={breadcrumbs}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="container mx-auto px-4 sm:px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
