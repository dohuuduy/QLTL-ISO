import React, { useMemo } from 'react';
import type { DanhMucTaiLieu, ReportType } from '../types';
import Card from './ui/Card';
import { formatDateForDisplay } from '../utils/dateUtils';

interface ExpiringDocumentsProps {
    documents: DanhMucTaiLieu[];
    onDocumentClick: (doc: DanhMucTaiLieu) => void;
    onNavigateToReport: (reportType: ReportType) => void;
}

const ExpiringDocuments: React.FC<ExpiringDocumentsProps> = ({ documents, onDocumentClick, onNavigateToReport }) => {

    const expiringDocs = useMemo(() => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const thresholdDate = new Date(today);
        thresholdDate.setUTCDate(today.getUTCDate() + 30); // Look 30 days ahead

        return documents
            .map(doc => {
                if (!doc.ngay_het_hieu_luc) return null;
                const expiryDate = new Date(doc.ngay_het_hieu_luc);
                if (expiryDate >= today && expiryDate <= thresholdDate) {
                    const diffTime = expiryDate.getTime() - today.getTime();
                    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return { ...doc, daysRemaining };
                }
                return null;
            })
            .filter((doc): doc is DanhMucTaiLieu & { daysRemaining: number } => doc !== null)
            .sort((a, b) => a.daysRemaining - b.daysRemaining)
            .slice(0, 5);
    }, [documents]);

    if (expiringDocs.length === 0) {
        return null; // Don't show the card if there's nothing to show
    }

    return (
        <Card>
            <Card.Header className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Tài liệu sắp hết hiệu lực</h3>
                <button
                    onClick={() => onNavigateToReport('expiring')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    Xem báo cáo
                </button>
            </Card.Header>
            <Card.Body className="p-0">
                 <ul role="list" className="divide-y divide-gray-200">
                    {expiringDocs.map(doc => (
                        <li key={doc.ma_tl} className="p-4 hover:bg-slate-50 cursor-pointer" onClick={() => onDocumentClick(doc)}>
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900 truncate pr-2">
                                    <span>{doc.ten_tai_lieu}</span>
                                    <span className="ml-2 text-gray-500 font-normal">({doc.so_hieu})</span>
                                </div>
                                <span className="flex-shrink-0 text-xs text-red-600 font-medium bg-red-100 px-2 py-0.5 rounded-full">{doc.daysRemaining} ngày</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Hết hạn ngày: {formatDateForDisplay(doc.ngay_het_hieu_luc)}
                            </p>
                        </li>
                    ))}
                </ul>
            </Card.Body>
        </Card>
    );
};

export default ExpiringDocuments;