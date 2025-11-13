import React from 'react';
import type { DanhMucTaiLieu } from '../types';
import Tabs from './ui/Tabs';
import Table from './ui/Table';
import Badge from './ui/Badge';

interface RelatedData {
    parent: DanhMucTaiLieu | null;
    children: DanhMucTaiLieu[];
    replaces: DanhMucTaiLieu | null;
    replacedBy: DanhMucTaiLieu[];
    sameStandard: DanhMucTaiLieu[];
    sameDepartment: DanhMucTaiLieu[];
}

interface RelatedDocumentsViewProps {
    selectedDoc: DanhMucTaiLieu;
    relatedData: RelatedData;
    onViewDetailsClick: (doc: DanhMucTaiLieu) => void;
}

const RelatedList: React.FC<{
    title: string;
    documents: DanhMucTaiLieu[];
    onViewDetailsClick: (doc: DanhMucTaiLieu) => void;
    emptyMessage: string;
}> = ({ title, documents, onViewDetailsClick, emptyMessage }) => {
    if (documents.length === 0) {
        return <p className="text-sm text-gray-500 mt-2">{emptyMessage}</p>;
    }

    return (
        <div>
            <h4 className="text-sm font-medium text-gray-600">{title}</h4>
            <ul className="mt-1 divide-y divide-gray-200">
                {documents.map(doc => (
                    <li key={doc.ma_tl} className="py-2">
                        <button 
                            onClick={() => onViewDetailsClick(doc)}
                            className="w-full text-left hover:bg-gray-50 rounded p-2"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-blue-600">{`${doc.ten_tai_lieu} (${doc.so_hieu})`}</span>
                                <Badge status={doc.trang_thai} size="sm" />
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const RelatedDocumentsView: React.FC<RelatedDocumentsViewProps> = ({ selectedDoc, relatedData, onViewDetailsClick }) => {
    
    const directRelations = [
        ...(relatedData.parent ? [{ ...relatedData.parent, relationType: 'Tài liệu cha' }] : []),
        ...relatedData.children.map(d => ({ ...d, relationType: 'Tài liệu con' })),
        ...(relatedData.replaces ? [{ ...relatedData.replaces, relationType: 'Thay thế cho' }] : []),
        ...relatedData.replacedBy.map(d => ({ ...d, relationType: 'Bị thay thế bởi' })),
    ];
    
    const tabs = [
        {
            title: 'Quan hệ trực tiếp',
            content: (
                <div className="p-4">
                    {directRelations.length > 0 ? (
                        <Table
                            data={directRelations}
                            onRowClick={(item) => onViewDetailsClick(item)}
                            columns={[
                                { header: 'Loại quan hệ', accessor: 'relationType' },
                                { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                { header: 'Số hiệu', accessor: 'so_hieu' },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                            ]}
                        />
                    ) : (
                        <p className="text-sm text-gray-500">Không có tài liệu nào có quan hệ trực tiếp.</p>
                    )}
                </div>
            )
        },
        {
            title: `Cùng Tiêu chuẩn (${relatedData.sameStandard.length})`,
            content: (
                 <div className="p-4">
                     {relatedData.sameStandard.length > 0 ? (
                        <Table
                            data={relatedData.sameStandard}
                            onRowClick={onViewDetailsClick}
                            columns={[
                                { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                { header: 'Số hiệu', accessor: 'so_hieu' },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                            ]}
                        />
                    ) : (
                        <p className="text-sm text-gray-500">Không có tài liệu nào cùng áp dụng tiêu chuẩn.</p>
                    )}
                 </div>
            )
        },
        {
            title: `Cùng Phòng ban (${relatedData.sameDepartment.length})`,
            content: (
                <div className="p-4">
                     {relatedData.sameDepartment.length > 0 ? (
                        <Table
                            data={relatedData.sameDepartment}
                            onRowClick={onViewDetailsClick}
                            columns={[
                                { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                { header: 'Số hiệu', accessor: 'so_hieu' },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                            ]}
                        />
                    ) : (
                        <p className="text-sm text-gray-500">Không có tài liệu nào khác trong cùng phòng ban.</p>
                    )}
                </div>
            )
        }
    ];
    
    const [activeTab, setActiveTab] = React.useState(0);

    return (
        <div>
             <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Mã tài liệu: {selectedDoc.ma_tl}</p>
                    </div>
                     <button
                        type="button"
                        onClick={() => onViewDetailsClick(selectedDoc)}
                        className="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
            <Tabs tabs={tabs} activeTabIndex={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default RelatedDocumentsView;