import React from 'react';
import { Icon } from './Icon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

interface ModalSubComponents {
    Footer: React.FC<{ children: React.ReactNode; className?: string }>;
}


const Modal: React.FC<ModalProps> & ModalSubComponents = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-stone-500 bg-opacity-75 transition-opacity dark:bg-black/80"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-xl bg-white dark:bg-stone-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                        <div className="bg-white dark:bg-stone-800 px-4 pt-5 sm:p-6 sm:pb-4">
                             <div className="flex items-start justify-between">
                                <h3 className="text-lg font-semibold leading-6 text-stone-900 dark:text-stone-100" id="modal-title">
                                    {title}
                                </h3>
                                <button onClick={onClose} className="text-stone-400 dark:text-stone-400 hover:text-stone-500 dark:hover:text-stone-300">
                                     <Icon type="x-mark" className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <div className={`bg-stone-50 dark:bg-stone-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-xl ${className}`}>
            {children}
        </div>
    );
};

Modal.Footer = ModalFooter;


export default Modal;