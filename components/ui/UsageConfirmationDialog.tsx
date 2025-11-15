import React from 'react';
import Modal from './Modal';
import { Icon } from './Icon';

interface UsageConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDelete: () => void;
    onConfirmDisable: () => void;
    isInUse: boolean;
    itemName: string;
    itemType: string;
}

const UsageConfirmationDialog: React.FC<UsageConfirmationDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirmDelete,
    onConfirmDisable,
    isInUse,
    itemName,
    itemType
}) => {
    if (!isOpen) return null;
    
    const title = isInUse ? `Không thể xóa ${itemType}` : `Xác nhận xóa ${itemType}`;
    const variant = isInUse ? 'info' : 'danger';
    
    const message = isInUse 
        ? `'${itemName}' đang được sử dụng trong hệ thống và không thể xóa vĩnh viễn. Thay vào đó, bạn có muốn "Vô hiệu hóa" mục này không? Thao tác này sẽ ẩn nó khỏi các lựa chọn trong tương lai nhưng vẫn giữ lại trên các hồ sơ cũ.`
        : `Bạn có chắc chắn muốn xóa vĩnh viễn '${itemName}' không? Hành động này không thể hoàn tác.`;

    const confirmButtonText = isInUse ? 'Vô hiệu hóa' : 'Xóa vĩnh viễn';
    const handleConfirm = isInUse ? onConfirmDisable : onConfirmDelete;
    
    const buttonClass = variant === 'danger' ? 'btn-danger' : 'btn-primary';
    const iconWrapperColorClasses = variant === 'danger' ? 'bg-red-100' : 'bg-blue-100';
    const iconColorClasses = variant === 'danger' ? 'text-red-600' : 'text-blue-600';
    const iconType = variant === 'danger' ? 'exclamation-triangle' : 'archive';


    return (
         <div className="relative z-20" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconWrapperColorClasses} sm:mx-0 sm:h-10 sm:w-10`}>
                                    <Icon type={iconType} className={`h-6 w-6 ${iconColorClasses}`} />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">{title}</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">{message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button onClick={handleConfirm} type="button" className={`${buttonClass} w-full sm:ml-3 sm:w-auto`}>
                                {confirmButtonText}
                            </button>
                            <button onClick={onClose} type="button" className="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageConfirmationDialog;
