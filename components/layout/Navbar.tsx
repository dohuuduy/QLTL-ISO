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
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
            <span className="text-sm font-medium leading-none text-slate-700">{getInitials(name)}</span>
        </span>
    );
};


interface NavbarProps {
    onLogoClick: () => void;
    onToggleSidebar: () => void;
    onToggleMobileMenu: () => void;
    currentUser?: NhanSu;
    onLogout: () => void;
    notifications: ThongBao[];
    onMarkNotificationRead: (id: string) => void;
    onMarkAllNotificationsRead: () => void;
    onNavigateToDocument: (docId: string) => void;
    chucVuList: ChucVu[];
}

const Navbar: React.FC<NavbarProps> = ({ 
    onLogoClick, onToggleSidebar, onToggleMobileMenu, 
    currentUser, onLogout, notifications, onMarkNotificationRead, onMarkAllNotificationsRead, onNavigateToDocument,
    chucVuList
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
        <header className="z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-slate-200 no-print">
            
            <div className="flex flex-1 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center">
                     {/* Desktop Sidebar Toggle */}
                    <button
                        type="button"
                        className="hidden md:block -ml-2 mr-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        onClick={onToggleSidebar}
                    >
                        <span className="sr-only">Toggle sidebar</span>
                        <Icon type="menu" className="h-6 w-6" />
                    </button>
                    {/* Mobile Sidebar Toggle */}
                    <button
                        type="button"
                        className="px-4 -ml-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                        onClick={onToggleMobileMenu}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Icon type="menu" className="h-6 w-6" />
                    </button>
                    
                    {/* Logo and Title */}
                    <button onClick={onLogoClick} className="flex items-center gap-x-2">
                        <Icon type="document-duplicate" className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">DocManager ISO</span>
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative" ref={notificationsRef}>
                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(prev => !prev)}
                            className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <span className="sr-only">View notifications</span>
                            <Icon type="bell" className="h-6 w-6" />
                             {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white">
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
                                className="flex items-center space-x-2 rounded-md p-1 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Avatar name={currentUser.ten} />
                                <span className="hidden text-sm font-medium text-gray-700 lg:block">{currentUser.ten}</span>
                                <Icon type="chevron-down" className="h-5 w-5 text-gray-400 hidden lg:block" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser.ten}</p>
                                        <p className="text-sm text-gray-500 truncate">{chucVuTen}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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