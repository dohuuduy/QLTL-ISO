import React, { useMemo } from 'react';
import type { DanhMucTaiLieu } from '../types';
import Card from './ui/Card';
import { Icon } from './ui/Icon';
import { formatDateForDisplay } from '../utils/dateUtils';

interface BookmarkedDocumentsProps {
    documents: DanhMucTaiLieu[];
    onDocumentClick: (doc: DanhMucTaiLieu) => void;
    onNavigateToDocuments: () => void;
}

const BookmarkedDocuments: React.FC<BookmarkedDocumentsProps> = ({ documents, onDocumentClick, onNavigateToDocuments }) => {
    const bookmarkedDocs = useMemo(() => {
        return documents
            .filter(doc => doc.is_bookmarked)
            .sort((a, b) => a.ten_tai_lieu.localeCompare(b.ten_tai_lieu))
            .slice(0, 5); // Show top 5
    }, [documents]);

    if (bookmarkedDocs.length === 0) {
        return null; // Don't show the card if there are no bookmarks
    }

    return (
        <Card>
            <Card.Header className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Tài liệu đã đánh dấu</h3>
                <button
                    onClick={onNavigateToDocuments}
                    className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
                >
                    Xem tất cả
                </button>
            </Card.Header>
            <Card.Body className="p-0">
                 <ul role="list" className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {bookmarkedDocs.map(doc => (
                        <li key={doc.ma_tl} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer" onClick={() => onDocumentClick(doc)}>
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate pr-2">
                                    <span>{doc.ten_tai_lieu}</span>
                                </div>
                                <Icon type="star-solid" className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            </div>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                {doc.so_hieu} - Hiệu lực từ: {formatDateForDisplay(doc.ngay_hieu_luc)}
                            </p>
                        </li>
                    ))}
                </ul>
            </Card.Body>
        </Card>
    );
};

export default BookmarkedDocuments;