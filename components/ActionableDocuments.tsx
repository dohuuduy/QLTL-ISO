import React, { useMemo } from 'react';
import type { DanhMucTaiLieu, NhanSu, PhienBanTaiLieu } from '../types';
import { DocumentStatus } from '../constants';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { Icon } from './ui/Icon';

interface ActionableDocumentsProps {
    documents: DanhMucTaiLieu[];
    versions: PhienBanTaiLieu[];
    currentUser: NhanSu;
    onDocumentClick: (doc: DanhMucTaiLieu) => void;
}

const ActionableDocuments: React.FC<ActionableDocumentsProps> = ({ documents, versions, currentUser, onDocumentClick }) => {
    
    const latestVersionMap = useMemo(() => new Map(
        versions.filter(v => v.is_moi_nhat).map(v => [v.ma_tl, v.phien_ban])
    ), [versions]);

    const myActionableDocs = useMemo(() => {
        return documents
            .filter(doc => 
                (doc.trang_thai === DocumentStatus.DANG_RA_SOAT && doc.nguoi_ra_soat === currentUser.id) ||
                (doc.trang_thai === DocumentStatus.CHO_PHE_DUYET && doc.nguoi_phe_duyet === currentUser.id)
            )
            .sort((a, b) => new Date(b.ngay_ban_hanh).getTime() - new Date(a.ngay_ban_hanh).getTime()); // Sort by most recent
    }, [documents, currentUser.id]);

    if (myActionableDocs.length === 0) {
        return (
            <Card>
                <Card.Body className="p-6 text-center">
                    <Icon type="check-circle" className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Hộp thư đến trống</h3>
                    <p className="mt-1 text-sm text-gray-500">Bạn không có tài liệu nào cần xử lý.</p>
                </Card.Body>
            </Card>
        );
    }
    
    const getStatusIcon = (status: DocumentStatus) => {
        switch (status) {
            case DocumentStatus.DANG_RA_SOAT:
                return { iconType: 'clock', bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
            case DocumentStatus.CHO_PHE_DUYET:
                return { iconType: 'paper-airplane', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
            default:
                return { iconType: 'document-text', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="text-base font-semibold text-gray-900">Tài liệu cần xử lý</h3>
            </Card.Header>
            <Card.Body className="p-0">
                <ul role="list" className="divide-y divide-gray-200">
                    {myActionableDocs.map(doc => {
                        const { iconType, bgColor, textColor } = getStatusIcon(doc.trang_thai);
                        return (
                            <li key={doc.ma_tl}>
                                <button
                                    onClick={() => onDocumentClick(doc)}
                                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors block"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 mt-0.5 flex items-center justify-center h-8 w-8 rounded-full ${bgColor}`}>
                                            <Icon type={iconType} className={`h-5 w-5 ${textColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate" title={doc.ten_tai_lieu}>
                                                {doc.ten_tai_lieu}
                                            </p>
                                            <div className="flex items-center gap-x-3 mt-1">
                                                <Badge status={doc.trang_thai} size="sm" />
                                                <span className="text-xs text-gray-500">
                                                    Phiên bản: {latestVersionMap.get(doc.ma_tl) || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </Card.Body>
        </Card>
    );
};

export default ActionableDocuments;
