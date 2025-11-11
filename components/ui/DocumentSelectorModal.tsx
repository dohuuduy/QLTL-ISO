import React, { useState, useMemo } from 'react';
import type { DanhMucTaiLieu } from '../../types';
import Modal from './Modal';
import { Icon } from './Icon';

interface DocumentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (docId: string) => void;
    title: string;
    documents: DanhMucTaiLieu[];
    currentSelectionId?: string;
}

const DocumentSelectorModal: React.FC<DocumentSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    title,
    documents,
    currentSelectionId,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDocuments = useMemo(() => {
        if (!searchTerm) return documents;
        const lowercasedTerm = searchTerm.toLowerCase();
        return documents.filter(doc =>
            doc.ten_tai_lieu.toLowerCase().includes(lowercasedTerm) ||
            doc.ma_tl.toLowerCase().includes(lowercasedTerm) ||
            doc.so_hieu.toLowerCase().includes(lowercasedTerm)
        );
    }, [documents, searchTerm]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-4 sm:p-6 border-t border-b border-gray-200">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Icon type="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mã, số hiệu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 pl-10 pr-3 text-gray-900 dark:text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm placeholder-gray-400 dark:placeholder-slate-400"
                    />
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {filteredDocuments.length > 0 ? (
                    <ul role="list" className="divide-y divide-gray-200">
                        {filteredDocuments.map(doc => (
                            <li key={doc.ma_tl}>
                                <button
                                    onClick={() => onSelect(doc.ma_tl)}
                                    className="w-full text-left p-4 hover:bg-slate-50 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{doc.ten_tai_lieu}</p>
                                        <p className="text-xs text-gray-500">{doc.ma_tl} / {doc.so_hieu}</p>
                                    </div>
                                    {doc.ma_tl === currentSelectionId && (
                                        <Icon type="check-circle" className="h-5 w-5 text-blue-600" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">Không tìm thấy tài liệu nào.</p>
                    </div>
                )}
            </div>
            <Modal.Footer>
                 <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Đóng</button>
            </Modal.Footer>
        </Modal>
    );
};

export default DocumentSelectorModal;