import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import type { NhanSu, ThongBao, ReportType, ChucVu } from '../../types';
import { useSidebar } from '../../hooks/use-sidebar';
import type { BreadcrumbItem } from '../ui/Breadcrumb';
import type { SaveStatus, Theme } from '../../App';
import SaveStatusToast from '../ui/SaveStatusToast';

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
    saveStatus: SaveStatus;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, currentUser, onLogout, onNavigate, 
    notifications, onMarkNotificationRead, onMarkAllNotificationsRead, onNavigateToDocument,
    currentView, onNavigateToReport, chucVuList, breadcrumbs,
    saveStatus, theme, setTheme
}) => {
    const { isCollapsed, isMobileOpen, setMobileOpen, toggleSidebar, setOpenFlyoutView } = useSidebar();

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
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                onCloseMobileMenu={() => setMobileOpen(false)}
                onNavigate={onNavigate}
                currentUser={currentUser}
                currentView={currentView}
            />
            <div 
                className="flex-1 flex flex-col overflow-hidden"
                onClick={() => {
                    if (isCollapsed) {
                        setOpenFlyoutView(null);
                    }
                }}
            >
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
                    theme={theme}
                    setTheme={setTheme}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="container mx-auto px-4 sm:px-6 py-8">
                        {children}
                    </div>
                </main>
                <SaveStatusToast status={saveStatus} />
            </div>
        </div>
    );
};

export default Layout;