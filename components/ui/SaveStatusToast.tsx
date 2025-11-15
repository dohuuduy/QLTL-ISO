import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { SaveStatus } from '../../App';

interface SaveStatusToastProps {
    status: SaveStatus;
}

const SaveStatusToast: React.FC<SaveStatusToastProps> = ({ status }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [animationClass, setAnimationClass] = useState('');
    // We need to keep track of the status to display, even while fading out
    const [displayStatus, setDisplayStatus] = useState<SaveStatus>('idle'); 

    useEffect(() => {
        // When a new status comes in (not idle), show the toast
        if (status !== 'idle') {
            setDisplayStatus(status);
            setIsVisible(true);
            setAnimationClass('toast-enter');
        } 
        // When parent component sets status to idle, start the fade-out
        else if (isVisible) { 
            setAnimationClass('toast-exit');
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [status, isVisible]);

    const handleClose = () => {
        setAnimationClass('toast-exit');
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 300);
    };

    if (!isVisible) {
        return null;
    }

    const config = {
        saving: {
            icon: (
                <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ),
            bgColor: 'bg-white border-slate-300',
            textColor: 'text-slate-700',
            text: 'Đang lưu...',
        },
        success: {
            icon: <Icon type="check-circle" className="h-6 w-6 text-green-500" />,
            bgColor: 'bg-white border-green-300',
            textColor: 'text-green-800',
            text: 'Đã lưu thành công!',
        },
        error: {
            icon: <Icon type="exclamation-circle" className="h-6 w-6 text-red-500" />,
            bgColor: 'bg-white border-red-300',
            textColor: 'text-red-700',
            text: 'Lưu thất bại!',
        },
        idle: { // a fallback
             icon: <Icon type="information-circle" className="h-6 w-6 text-slate-500" />,
             bgColor: 'bg-white border-slate-300',
             textColor: 'text-slate-700',
             text: 'Chờ...',
        }
    };

    const currentConfig = config[displayStatus];

    return (
        <div 
            className={`fixed bottom-5 right-5 z-50 flex items-start gap-x-4 p-4 rounded-lg shadow-lg border w-full max-w-sm ${currentConfig.bgColor} ${animationClass}`}
            role="status"
            aria-live="polite"
        >
            <div className="flex-shrink-0 mt-0.5">{currentConfig.icon}</div>
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">Trạng thái đồng bộ</h3>
                <p className={`text-sm ${currentConfig.textColor}`}>{currentConfig.text}</p>
            </div>
            <div className="flex-shrink-0">
                <button
                    onClick={handleClose}
                    className="-mr-1.5 -mt-1.5 p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    aria-label="Đóng"
                >
                    <Icon type="x-mark" className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default SaveStatusToast;
