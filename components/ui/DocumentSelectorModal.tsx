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
                <div className="search-input-container">
                    <Icon type="search" className="search-input-icon h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mã, số hiệu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input search-input"
                    />
                     {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="search-input-clear-btn"
                            title="Xóa"
                        >
                            <Icon type="x-mark" className="h-5 w-5" />
                        </button>
                    )}
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
                                        <p className="text-xs text-gray-500">{doc.so_hieu}</p>
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
                 <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Đóng</button>
            </Modal.Footer>
        </Modal>
    );
};

export default DocumentSelectorModal;