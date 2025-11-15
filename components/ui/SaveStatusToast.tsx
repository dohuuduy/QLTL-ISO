import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { SaveStatus } from '../../App';

interface SaveStatusToastProps {
    status: SaveStatus;
}

const SaveStatusToast: React.FC<SaveStatusToastProps> = ({ status }) => {
    const [internalStatus, setInternalStatus] = useState(status);
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        if (status !== 'idle') {
            setInternalStatus(status);
            setAnimationClass('toast-enter');
        } else {
            // When the parent wants to hide, we start the exit animation.
            setAnimationClass('toast-exit');
            const timer = setTimeout(() => {
                // After the animation finishes, we update the internal state
                // to 'idle', which will cause the component to return null.
                setInternalStatus('idle');
            }, 300); // This duration must match the CSS animation duration.

            return () => clearTimeout(timer);
        }
    }, [status]);

    if (internalStatus === 'idle') {
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
            icon: <Icon type="check-circle" className="h-5 w-5 text-green-500" />,
            bgColor: 'bg-white border-green-300',
            textColor: 'text-green-800',
            text: 'Đã lưu thành công!',
        },
        error: {
            icon: <Icon type="exclamation-circle" className="h-5 w-5 text-red-500" />,
            bgColor: 'bg-white border-red-300',
            textColor: 'text-red-700',
            text: 'Lưu thất bại!',
        },
    };

    const currentConfig = config[internalStatus];

    return (
        <div 
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-x-3 px-4 py-3 rounded-lg shadow-lg border ${currentConfig.bgColor} ${animationClass}`}
            role="status"
            aria-live="polite"
        >
            <div className="flex-shrink-0">{currentConfig.icon}</div>
            <p className={`text-sm font-medium ${currentConfig.textColor}`}>{currentConfig.text}</p>
        </div>
    );
};

export default SaveStatusToast;
