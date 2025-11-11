import React, { useMemo } from 'react';
import type { DanhMucTaiLieu, NhanSu, PhienBanTaiLieu } from '../types';
import { DocumentStatus } from '../constants';
import Card from './ui/Card';
import Table from './ui/Table';
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

    const myActionableDocs = documents.filter(doc => 
        (doc.trang_thai === DocumentStatus.DANG_RA_SOAT && doc.nguoi_ra_soat === currentUser.id) ||
        (doc.trang_thai === DocumentStatus.CHO_PHE_DUYET && doc.nguoi_phe_duyet === currentUser.id)
    );

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
    
    return (
        <Card>
             <Card.Header>
                <h3 className="text-base font-semibold text-gray-900">Tài liệu cần xử lý</h3>
            </Card.Header>
             <Table<DanhMucTaiLieu>
                columns={[
                    { header: 'Tên tài liệu', accessor: 'ten_tai_lieu', className: 'min-w-[12rem]' },
                    { header: 'Số hiệu', accessor: 'so_hieu', className: 'w-32' },
                    { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.ma_tl) || 'N/A', className: 'w-24 text-center' },
                    { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} />, className: 'w-40' },
                    {
                        header: 'In',
                        accessor: (item: DanhMucTaiLieu) => {
                            if (item.file_pdf) {
                                return (
                                    <a
                                        href={item.file_pdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center justify-center text-gray-500 hover:text-blue-700 w-full"
                                        title="Mở PDF để in"
                                    >
                                        <Icon type="printer" className="h-5 w-5" />
                                    </a>
                                )
                            }
                            return (
                                <span className="inline-flex items-center justify-center text-gray-300 w-full cursor-not-allowed" title="Không có file PDF">
                                    <Icon type="printer" className="h-5 w-5" />
                                </span>
                            );
                        },
                        className: 'w-16 text-center'
                    }
                ]}
                data={myActionableDocs}
                onRowClick={onDocumentClick}
            />
        </Card>
    );
};

export default ActionableDocuments;