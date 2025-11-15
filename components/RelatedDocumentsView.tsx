import React, { useMemo } from 'react';
import type { DanhMucTaiLieu } from '../types';
import Tabs from './ui/Tabs';
import Table from './ui/Table';
import Badge from './ui/Badge';
import { Icon } from './ui/Icon';

type TreeItem = {
    doc: DanhMucTaiLieu;
    level: number;
};

/**
 * Builds a full document hierarchy tree (ancestors and descendants) for a given document.
 * @param selectedDoc The document to start from.
 * @param allDocuments The list of all documents in the system.
 * @returns A flat array representing the tree, with each item having a 'level' for indentation.
 */
const buildDocumentTree = (selectedDoc: DanhMucTaiLieu, allDocuments: DanhMucTaiLieu[]): TreeItem[] => {
    if (!selectedDoc) return [];

    const docMap = new Map(allDocuments.map(d => [d.ma_tl, d]));
    
    // 1. Find the ultimate root ancestor
    let rootDoc = selectedDoc;
    while (rootDoc.ma_tl_cha && docMap.has(rootDoc.ma_tl_cha)) {
        rootDoc = docMap.get(rootDoc.ma_tl_cha)!;
    }

    // 2. Recursively build the tree from the root
    const tree: TreeItem[] = [];
    const getDescendants = (docId: string, level: number) => {
        const doc = docMap.get(docId);
        if (doc) {
            tree.push({ doc, level });
            const children = allDocuments.filter(d => d.ma_tl_cha === docId);
            for (const child of children) {
                getDescendants(child.ma_tl, level + 1);
            }
        }
    };
    
    getDescendants(rootDoc.ma_tl, 0);

    return tree;
};

interface RelatedDocumentsViewProps {
    selectedDoc: DanhMucTaiLieu;
    allDocuments: DanhMucTaiLieu[];
    onViewDetailsClick: (doc: DanhMucTaiLieu) => void;
}

const RelatedDocumentsView: React.FC<RelatedDocumentsViewProps> = ({ selectedDoc, allDocuments, onViewDetailsClick }) => {
    
    const treeData = useMemo(() => buildDocumentTree(selectedDoc, allDocuments), [selectedDoc, allDocuments]);

    const sameStandardData = useMemo(() => {
        if (!selectedDoc || !selectedDoc.tieu_chuan_ids || selectedDoc.tieu_chuan_ids.length === 0) return [];
        return allDocuments.filter(d => 
            d.ma_tl !== selectedDoc.ma_tl && 
            d.tieu_chuan_ids.some(id => selectedDoc.tieu_chuan_ids.includes(id))
        );
    }, [selectedDoc, allDocuments]);

    const sameDepartmentData = useMemo(() => {
        if (!selectedDoc) return [];
        return allDocuments.filter(d => 
            d.ma_tl !== selectedDoc.ma_tl && 
            d.phong_ban_quan_ly === selectedDoc.phong_ban_quan_ly
        );
    }, [selectedDoc, allDocuments]);
    
    const PdfColumn = { 
        header: 'PDF', 
        accessor: (item: any) => {
            const doc = item.doc || item;
            return (
                doc.file_pdf ? (
                    <a
                        href={doc.file_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center text-gray-500 hover:text-blue-700 w-full"
                        title="Mở file PDF"
                    >
                        <Icon type="document-text" className="h-5 w-5" />
                    </a>
                ) : (
                    <span 
                        className="inline-flex items-center justify-center text-gray-300 w-full cursor-not-allowed"
                        title="Không có file PDF"
                    >
                        <Icon type="document-text" className="h-5 w-5" />
                    </span>
                )
            );
        },
        className: 'w-16 text-center'
    };

    const tabs = [
        {
            title: `Cây gia phả (${treeData.length})`,
            content: (
                <div className="p-4">
                    {treeData.length > 0 ? (
                        <Table
                            data={treeData}
                            onRowClick={(item) => onViewDetailsClick(item.doc)}
                            columns={[
                                { header: 'Tên tài liệu', accessor: (item) => (
                                    <div className="flex items-center">
                                         <span 
                                            style={{ paddingLeft: `${item.level * 1.5}rem` }}
                                            className={`truncate ${item.doc.ma_tl === selectedDoc.ma_tl ? 'font-bold text-blue-700' : ''}`}
                                            title={item.doc.ten_tai_lieu}
                                        >
                                            {item.level > 0 && <span className="mr-2 text-gray-400">└─</span>}
                                            {item.doc.ten_tai_lieu}
                                        </span>
                                    </div>
                                ) },
                                { header: 'Số hiệu', accessor: (item) => item.doc.so_hieu },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.doc.trang_thai} /> },
                                PdfColumn
                            ]}
                        />
                    ) : (
                        <p className="text-sm text-gray-500">Không có tài liệu nào có quan hệ trực tiếp.</p>
                    )}
                </div>
            )
        },
        {
            title: `Cùng Tiêu chuẩn (${sameStandardData.length})`,
            content: (
                 <div className="p-4">
                     {sameStandardData.length > 0 ? (
                        <Table
                            data={sameStandardData}
                            onRowClick={onViewDetailsClick}
                            columns={[
                                { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                { header: 'Số hiệu', accessor: 'so_hieu' },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                                PdfColumn
                            ]}
                        />
                    ) : (
                        <p className="text-sm text-gray-500">Không có tài liệu nào cùng áp dụng tiêu chuẩn.</p>
                    )}
                 </div>
            )
        },
        {
            title: `Cùng Phòng ban (${sameDepartmentData.length})`,
            content: (
                <div className="p-4">
                     {sameDepartmentData.length > 0 ? (
                        <Table
                            data={sameDepartmentData}
                            onRowClick={onViewDetailsClick}
                            columns={[
                                { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                { header: 'Số hiệu', accessor: 'so_hieu' },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                                PdfColumn
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
                        <p className="text-sm text-gray-500">Số hiệu: {selectedDoc.so_hieu}</p>
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
