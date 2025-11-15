import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '../ui/Icon';
import type { NhanSu, ThongBao, ChucVu } from '../../types';
import NotificationPanel from '../NotificationPanel';
import Breadcrumb from '../ui/Breadcrumb';
import type { BreadcrumbItem } from '../ui/Breadcrumb';
import type { Theme } from '../../App';

const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const getInitials = (nameStr: string) => {
        if (!nameStr) return '?';
        const words = nameStr.split(' ').filter(Boolean);
        if (words.length === 0) return '?';
        const first = words[0][0];
        const last = words.length > 1 ? words[words.length - 1][0] : '';
        return `${first}${last}`.toUpperCase();
    };

    return (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
            <span className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">{getInitials(name)}</span>
        </span>
    );
};


interface NavbarProps {
    onToggleSidebar: () => void;
    onToggleMobileMenu: () => void;
    currentUser?: NhanSu;
    onLogout: () => void;
    notifications: ThongBao[];
    onMarkNotificationRead: (id: string) => void;
    onMarkAllNotificationsRead: () => void;
    onNavigateToDocument: (docId: string) => void;
    chucVuList: ChucVu[];
    breadcrumbs: BreadcrumbItem[];
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
    onToggleSidebar, onToggleMobileMenu, 
    currentUser, onLogout, notifications, onMarkNotificationRead, onMarkAllNotificationsRead, onNavigateToDocument,
    chucVuList, breadcrumbs, theme, setTheme
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const chucVuMap = useMemo(() => new Map(chucVuList.filter(Boolean).map(cv => [cv.id, cv.ten])), [chucVuList]);
    const chucVuTen = currentUser ? chucVuMap.get(currentUser.chuc_vu) : '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef, notificationsRef]);

    const ThemeSwitcherButton: React.FC<{
        value: Theme;
        label: string;
        icon: string;
    }> = ({ value, label, icon }) => {
        const isActive = theme === value;
        return (
            <button
                onClick={() => setTheme(value)}
                className={`w-full rounded-md py-1.5 text-sm font-medium flex items-center justify-center gap-2 ${
                    isActive
                        ? 'bg-white dark:bg-slate-900/75 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-600/50'
                }`}
            >
                <Icon type={icon} className="h-4 w-4" />
                <span>{label}</span>
            </button>
        );
    };


    return (
        <header className="z-10 flex h-16 flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 no-print">
            
            <div className="flex flex-1 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center min-w-0">
                     {/* Desktop Sidebar Toggle */}
                    <button
                        type="button"
                        className="hidden md:block -ml-2 mr-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        onClick={onToggleSidebar}
                    >
                        <span className="sr-only">Toggle sidebar</span>
                        <Icon type="menu" className="h-6 w-6" />
                    </button>
                    {/* Mobile Sidebar Toggle */}
                    <button
                        type="button"
                        className="px-4 -ml-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                        onClick={onToggleMobileMenu}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Icon type="menu" className="h-6 w-6" />
                    </button>
                    
                    {/* Breadcrumb replaces Logo and Title */}
                    <div className="min-w-0">
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="relative" ref={notificationsRef}>
                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(prev => !prev)}
                            className="relative rounded-full bg-white dark:bg-slate-800 p-1 text-gray-400 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                        >
                            <span className="sr-only">View notifications</span>
                            <Icon type="bell" className="h-6 w-6" />
                             {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800">
                                    <span className="sr-only">{unreadCount} unread notifications</span>
                                </span>
                            )}
                        </button>
                         {isNotificationsOpen && (
                            <NotificationPanel
                                notifications={notifications}
                                onClose={() => setIsNotificationsOpen(false)}
                                onMarkAsRead={onMarkNotificationRead}
                                onMarkAllRead={onMarkAllNotificationsRead}
                                onNavigateToDocument={onNavigateToDocument}
                            />
                        )}
                    </div>
                   

                    {currentUser && (
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center space-x-2 rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            >
                                <Avatar name={currentUser.ten} />
                                <span className="hidden text-sm font-medium text-gray-700 dark:text-slate-300 lg:block">{currentUser.ten}</span>
                                <Icon type="chevron-down" className="h-5 w-5 text-gray-400 hidden lg:block" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{currentUser.ten}</p>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{chucVuTen}</p>
                                    </div>
                                    <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Giao diện</p>
                                        <div className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-700 p-1 space-x-1">
                                            <ThemeSwitcherButton value="light" label="Sáng" icon="sun" />
                                            <ThemeSwitcherButton value="dark" label="Tối" icon="moon" />
                                            <ThemeSwitcherButton value="system" label="Hệ thống" icon="computer-desktop" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;