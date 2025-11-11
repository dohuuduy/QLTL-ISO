import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '../ui/Icon';
import type { NhanSu, ThongBao, ChucVu } from '../../types';
import NotificationPanel from '../NotificationPanel';

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
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-600">
            <span className="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300">{getInitials(name)}</span>
        </span>
    );
};

interface ThemeSwitcherProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className="relative rounded-full p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        <Icon type={theme === 'light' ? 'moon' : 'sun'} className="h-6 w-6" />
    </button>
);


interface NavbarProps {
    onLogoClick: () => void;
    onToggleSidebar: () => void;
    isSidebarCollapsed: boolean;
    onToggleMobileMenu: () => void;
    currentUser?: NhanSu;
    onLogout: () => void;
    notifications: ThongBao[];
    onMarkNotificationRead: (id: string) => void;
    onMarkAllNotificationsRead: () => void;
    onNavigateToDocument: (docId: string) => void;
    chucVuList: ChucVu[];
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
    onLogoClick, onToggleSidebar, isSidebarCollapsed, onToggleMobileMenu, 
    currentUser, onLogout, notifications, onMarkNotificationRead, onMarkAllNotificationsRead, onNavigateToDocument,
    chucVuList, theme, onToggleTheme
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

    return (
        <div className="relative z-10 flex h-16 flex-shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm border-b border-zinc-200/50 dark:border-zinc-700/50 no-print">
            <button
                type="button"
                className="border-r border-zinc-200/50 dark:border-zinc-700/50 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 md:hidden"
                onClick={onToggleMobileMenu}
            >
                <span className="sr-only">Open sidebar</span>
                <Icon type="menu" className="h-6 w-6" />
            </button>
            
            <div className="flex flex-1 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center">
                     {/* Desktop: Logo and Title */}
                    <button onClick={onLogoClick} className="hidden md:flex items-center space-x-3">
                        <Icon type="document-duplicate" className="h-8 w-8 text-teal-600 dark:text-teal-500" />
                        <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">DocManager ISO</span>
                    </button>
                    {/* Desktop: Sidebar toggle button */}
                     <button
                        type="button"
                        className="hidden md:inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-zinc-400 hover:text-gray-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 ml-4"
                        onClick={onToggleSidebar}
                    >
                         <Icon 
                            type="chevron-double-left" 
                            className={`h-6 w-6 transition-transform duration-300 ${!isSidebarCollapsed ? '' : 'rotate-180'}`} 
                        />
                    </button>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    <ThemeSwitcher theme={theme} onToggle={onToggleTheme} />
                    <div className="relative" ref={notificationsRef}>
                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(prev => !prev)}
                            className="relative rounded-full p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900"
                        >
                            <span className="sr-only">View notifications</span>
                            <Icon type="bell" className="h-6 w-6" />
                             {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-800">
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
                                className="flex items-center space-x-2 rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900"
                            >
                                <Avatar name={currentUser.ten} />
                                <span className="hidden text-sm font-medium text-gray-700 dark:text-zinc-300 lg:block">{currentUser.ten}</span>
                                <Icon type="chevron-down" className="h-5 w-5 text-gray-400 dark:text-zinc-400 hidden lg:block" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-zinc-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-zinc-700 focus:outline-none">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{currentUser.ten}</p>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">{chucVuTen}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;