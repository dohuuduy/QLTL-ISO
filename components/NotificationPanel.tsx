import React from 'react';
import type { ThongBao } from '../types';
import { NotificationType } from '../constants';
import { Icon } from './ui/Icon';
import { formatRelativeTime } from '../utils/dateUtils';

interface NotificationPanelProps {
    notifications: ThongBao[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllRead: () => void;
    onNavigateToDocument: (docId: string) => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const iconMap: Record<NotificationType, { iconType: string, color: string }> = {
        [NotificationType.APPROVAL_PENDING]: { iconType: 'check-circle', color: 'text-yellow-500' },
        [NotificationType.REVIEW_DUE]: { iconType: 'clock', color: 'text-blue-500' },
        [NotificationType.REVIEW_OVERDUE]: { iconType: 'bell', color: 'text-red-500' },
        [NotificationType.EXPIRY_APPROACHING]: { iconType: 'exclamation-triangle', color: 'text-orange-500' },
    };
    const { iconType, color } = iconMap[type] || { iconType: 'bell', color: 'text-gray-500' };
    
    return (
        <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-700 ${color}`}>
            <Icon type={iconType} className="h-6 w-6" />
        </div>
    );
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onMarkAsRead, onMarkAllRead, onNavigateToDocument }) => {
    
    const handleItemClick = (notification: ThongBao) => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        onNavigateToDocument(notification.ma_tl);
        onClose();
    };

    const handleMarkAll = () => {
        onMarkAllRead();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-md bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-zinc-700 focus:outline-none z-20">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Thông báo</h3>
                    {notifications.some(n => !n.is_read) && (
                        <button onClick={handleMarkAll} className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300">
                            Đánh dấu tất cả là đã đọc
                        </button>
                    )}
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Bạn không có thông báo nào.</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <button 
                            key={notification.id} 
                            onClick={() => handleItemClick(notification)}
                            className={`w-full text-left p-4 flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 ${!notification.is_read ? 'bg-teal-50/50 dark:bg-teal-900/30' : ''}`}
                        >
                            <NotificationIcon type={notification.type} />
                            <div className="flex-1">
                                <p className="text-sm text-zinc-800 dark:text-zinc-200">{notification.message}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatRelativeTime(notification.timestamp)}</p>
                            </div>
                            {!notification.is_read && (
                                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full mt-1 flex-shrink-0"></div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;