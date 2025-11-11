import React from 'react';
import Modal from './Modal';
import { Icon } from './Icon';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
    variant?: 'danger' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmButtonText = 'Xác nhận',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const buttonColorClasses = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        : 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500';

    const iconWrapperColorClasses = variant === 'danger'
        ? 'bg-red-100 dark:bg-red-900/40'
        : 'bg-teal-100 dark:bg-teal-900/40';
        
    const iconColorClasses = variant === 'danger'
        ? 'text-red-600 dark:text-red-400'
        : 'text-teal-600 dark:text-teal-400';
    
    const iconType = variant === 'danger' ? 'exclamation-triangle' : 'question-mark-circle';

    return (
         <div className="relative z-20" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity dark:bg-black/80"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-xl bg-white dark:bg-zinc-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white dark:bg-zinc-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconWrapperColorClasses} sm:mx-0 sm:h-10 sm:w-10`}>
                                    <Icon type={iconType} className={`h-6 w-6 ${iconColorClasses}`} />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100" id="modal-title">{title}</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button onClick={onConfirm} type="button" className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto ${buttonColorClasses}`}>
                                {confirmButtonText}
                            </button>
                            <button onClick={onClose} type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:mt-0 sm:w-auto">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;