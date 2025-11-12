import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
    DanhMucTaiLieu, 
    NhanSu, 
    PhongBan, 
    LoaiTaiLieu, 
    CapDoTaiLieu, 
    MucDoBaoMat, 
    TieuChuan,
    PhienBanTaiLieu,
    NhatKyThayDoi,
    PhanPhoiTaiLieu,
    LichRaSoat,
    DaoTaoTruyenThong,
    RuiRoCoHoi,
    AuditLog,
    ThongBao,
    LichAudit
} from '../types';
import { DocumentStatus, VersionStatus } from '../constants';
import { Icon } from './ui/Icon';
import Card from './ui/Card';
import Table from './ui/Table';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import ConfirmationDialog from './ui/ConfirmationDialog';
import DocumentForm from './forms/DocumentForm';
import { formatDateForDisplay } from '../utils/dateUtils';
import { translate } from '../utils/translations';
import { exportToCsv, exportVisibleReportToWord } from '../utils/exportUtils';
import ExportDropdown from './ui/ExportDropdown';
import RelatedDocumentsView from './RelatedDocumentsView';
import Pagination from './ui/Pagination';
import PrintReportLayout from './PrintReportLayout';

type AllData = {
    documents: DanhMucTaiLieu[];
    versions: PhienBanTaiLieu[];
    nhanSu: NhanSu[];
    phongBan: PhongBan[];
    loaiTaiLieu: LoaiTaiLieu[];
    capDoTaiLieu: CapDoTaiLieu[];
    mucDoBaoMat: MucDoBaoMat[];
    tieuChuan: TieuChuan[];
};

interface DocumentManagementPageProps {
    allData: AllData;
    onUpdateData: React.Dispatch<React.SetStateAction<any>>;
    currentUser: NhanSu;
    onViewDetails: (doc: DanhMucTaiLieu) => void;
    onToggleBookmark: (docId: string) => void;
    initialFilter: string | null;
}

type SortConfig = {
    key: string;
    direction: 'ascending' | 'descending';
} | null;


const DocumentManagementPage: React.FC<DocumentManagementPageProps> = ({ allData, onUpdateData, currentUser, onViewDetails, onToggleBookmark, initialFilter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<DanhMucTaiLieu | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [relatedDoc, setRelatedDoc] = useState<DanhMucTaiLieu | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: '', department: '', standard: '' });
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ngay_hieu_luc', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        if (initialFilter === 'bookmarked') {
            setShowBookmarkedOnly(true);
        }
    }, [initialFilter]);
    
    // Reset to page 1 whenever filters, sorting, or items per page change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, showBookmarkedOnly, sortConfig, itemsPerPage]);

    const { phongBanMap, loaiTaiLieuMap, latestVersionMap } = useMemo(() => ({
        phongBanMap: new Map(allData.phongBan.filter(Boolean).map(pb => [pb.id, pb.ten])),
        loaiTaiLieuMap: new Map(allData.loaiTaiLieu.filter(Boolean).map(ltl => [ltl.id, ltl.ten])),
        latestVersionMap: new Map(allData.versions.filter(v => v && v.is_moi_nhat).map(v => [v.ma_tl, v.phien_ban]))
    }), [allData.phongBan, allData.loaiTaiLieu, allData.versions]);
    
    const canCreate = currentUser.role === 'admin' || !!currentUser.permissions?.canCreate;
    const canUpdate = currentUser.role === 'admin' || !!currentUser.permissions?.canUpdate;
    const canDelete = currentUser.role === 'admin' || !!currentUser.permissions?.canDelete;

    const filteredDocuments = useMemo(() => {
        return allData.documents.filter(doc => {
            if (showBookmarkedOnly && !doc.is_bookmarked) {
                return false;
            }

            const matchesSearch =
                doc.ten_tai_lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.ma_tl.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.so_hieu.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = (() => {
                if (filters.status === '') { // Default view: all except expired
                    return doc.trang_thai !== DocumentStatus.HET_HIEU_LUC;
                }
                if (filters.status === 'all_docs') { // User explicitly selected all
                    return true;
                }
                return doc.trang_thai === filters.status; // User selected a specific status
            })();
            
            const matchesDepartment = filters.department ? doc.phong_ban_quan_ly === filters.department : true;
            const matchesStandard = filters.standard ? doc.tieu_chuan_ids.includes(filters.standard) : true;
            
            return matchesSearch && matchesStatus && matchesDepartment && matchesStandard;
        });
    }, [allData.documents, searchTerm, filters, showBookmarkedOnly]);

    const sortedDocuments = useMemo(() => {
        let sortableItems = [...filteredDocuments];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortConfig.key) {
                    case 'phong_ban_quan_ly':
                        aValue = phongBanMap.get(a.phong_ban_quan_ly) || '';
                        bValue = phongBanMap.get(b.phong_ban_quan_ly) || '';
                        break;
                    case 'phien_ban':
                        aValue = latestVersionMap.get(a.ma_tl) || '';
                        bValue = latestVersionMap.get(b.ma_tl) || '';
                        break;
                    default:
                        aValue = a[sortConfig.key as keyof DanhMucTaiLieu];
                        bValue = b[sortConfig.key as keyof DanhMucTaiLieu];
                }
                
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredDocuments, sortConfig, phongBanMap, latestVersionMap]);

    const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);

    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedDocuments.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedDocuments, currentPage, itemsPerPage]);

    const relatedDocsData = useMemo(() => {
        if (!relatedDoc) return null;

        const parent = relatedDoc.ma_tl_cha ? allData.documents.find(d => d.ma_tl === relatedDoc.ma_tl_cha) : null;
        const children = allData.documents.filter(d => d.ma_tl_cha === relatedDoc.ma_tl);
        
        const replaces = relatedDoc.tai_lieu_thay_the ? allData.documents.find(d => d.ma_tl === relatedDoc.tai_lieu_thay_the) : null;
        const replacedBy = allData.documents.filter(d => d.tai_lieu_thay_the === relatedDoc.ma_tl);

        const sameStandard = allData.documents.filter(d => 
            d.ma_tl !== relatedDoc.ma_tl && 
            d.tieu_chuan_ids.some(id => relatedDoc.tieu_chuan_ids.includes(id))
        );
        const sameDepartment = allData.documents.filter(d => 
            d.ma_tl !== relatedDoc.ma_tl && 
            d.phong_ban_quan_ly === relatedDoc.phong_ban_quan_ly
        );

        return { parent, children, replaces, replacedBy, sameStandard, sameDepartment };
    }, [relatedDoc, allData.documents]);

    const printLayoutProps = useMemo(() => {
        if (sortedDocuments.length === 0) return null;

        const activeFilters: Record<string, string> = {};
        if (filters.status && filters.status !== 'all_docs') {
            activeFilters['Trạng thái'] = translate(filters.status);
        } else if (filters.status === 'all_docs') {
            activeFilters['Trạng thái'] = 'Tất cả';
        } else {
            activeFilters['Trạng thái'] = 'Tài liệu đang dùng';
        }
        if (filters.department) {
            activeFilters['Phòng ban'] = phongBanMap.get(filters.department) || 'N/A';
        }
        if (filters.standard) {
            activeFilters['Tiêu chuẩn'] = allData.tieuChuan.find(t => t.id === filters.standard)?.ten || 'N/A';
        }
        if (searchTerm) {
            activeFilters['Từ khóa tìm kiếm'] = searchTerm;
        }

        return {
            title: 'Danh sách tài liệu',
            filters: activeFilters,
            columns: [
                { header: 'Mã TL', accessor: (item: DanhMucTaiLieu) => item.ma_tl },
                { header: 'Tên tài liệu', accessor: (item: DanhMucTaiLieu) => item.ten_tai_lieu },
                { header: 'Phiên bản', accessor: (item: DanhMucTaiLieu) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                { header: 'Phòng ban', accessor: (item: DanhMucTaiLieu) => phongBanMap.get(item.phong_ban_quan_ly) },
                { header: 'Trạng thái', accessor: (item: DanhMucTaiLieu) => translate(item.trang_thai) },
                { header: 'Ngày hiệu lực', accessor: (item: DanhMucTaiLieu) => formatDateForDisplay(item.ngay_hieu_luc) },
            ],
            data: sortedDocuments,
        };
    }, [sortedDocuments, filters, searchTerm, phongBanMap, latestVersionMap, allData.tieuChuan]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortableHeader = (label: string, key: string) => {
        const isSorting = sortConfig?.key === key;
        const sortIcon = isSorting 
            ? (sortConfig.direction === 'ascending' ? 'chevron-up' : 'chevron-down')
            : 'chevron-down';
        
        return (
            <button 
                onClick={() => requestSort(key)} 
                className="group inline-flex items-center gap-1"
            >
                <span>{label}</span>
                <Icon 
                    type={sortIcon} 
                    className={`h-4 w-4 transition-opacity ${isSorting ? 'opacity-100 text-gray-700' : 'opacity-0 text-gray-400 group-hover:opacity-100'}`} 
                />
            </button>
        );
    };

    const openModal = (doc: DanhMucTaiLieu | null = null) => {
        setEditingDocument(doc);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingDocument(null);
        setIsModalOpen(false);
    };
    
    const handleOpenRelatedModal = (doc: DanhMucTaiLieu) => {
        setRelatedDoc(doc);
    };

    const handleNavigateFromModal = (doc: DanhMucTaiLieu) => {
        setRelatedDoc(null);
        onViewDetails(doc);
    };

    const handleSave = (formData: DanhMucTaiLieu) => {
        onUpdateData((prev: any) => {
            if (!prev) return null;

            let newDocumentsList;
            let newVersionsList = prev.versions;

            if (editingDocument) { // Editing
                newDocumentsList = prev.documents.map((item: DanhMucTaiLieu) =>
                    item.ma_tl === editingDocument.ma_tl ? formData : item
                );
            } else { // Creating
                const newDoc = { ...formData, ma_tl: `TL-${uuidv4().split('-')[0].toUpperCase()}` };
                newDocumentsList = [...prev.documents, newDoc];

                const newVersion: PhienBanTaiLieu = {
                    id_phien_ban: `v-${uuidv4()}`,
                    ma_tl: newDoc.ma_tl,
                    phien_ban: '1.0',
                    ngay_phat_hanh: newDoc.ngay_ban_hanh,
                    trang_thai_phien_ban: VersionStatus.BAN_THAO,
                    tom_tat_thay_doi: 'Ban hành lần đầu',
                    noi_dung_cap_nhat: 'Toàn bộ nội dung',
                    nguoi_thuc_hien: newDoc.nguoi_soan_thao,
                    is_moi_nhat: true,
                };
                newVersionsList = [...newVersionsList, newVersion];
            }
            return { ...prev, documents: newDocumentsList, versions: newVersionsList };
        });
        closeModal();
    };

    const handleDelete = () => {
        if (!deletingId) return;

        onUpdateData((prev: any) => {
            if (!prev) return null;

            // Find versions of the document to be deleted to clean up related data
            const versionsToDelete = prev.versions
                .filter((v: PhienBanTaiLieu) => v.ma_tl === deletingId)
                .map((v: PhienBanTaiLieu) => v.id_phien_ban);
            const versionsToDeleteSet = new Set(versionsToDelete);

            // Filter out all related data
            const newVersions = prev.versions.filter((v: PhienBanTaiLieu) => v.ma_tl !== deletingId);
            const newChangeLogs = prev.changeLogs.filter((cl: NhatKyThayDoi) => !versionsToDeleteSet.has(cl.id_phien_ban));
            const newDistributions = prev.distributions.filter((d: PhanPhoiTaiLieu) => !versionsToDeleteSet.has(d.id_phien_ban));
            const newReviewSchedules = prev.reviewSchedules.filter((rs: LichRaSoat) => rs.ma_tl !== deletingId);
            const newTrainings = prev.trainings.filter((t: DaoTaoTruyenThong) => t.ma_tl !== deletingId);
            const newRisks = prev.risks.filter((r: RuiRoCoHoi) => r.ma_tl !== deletingId);
            const newAuditTrail = prev.auditTrail.filter((log: AuditLog) => log.ma_tl !== deletingId);
            const newNotifications = prev.notifications.filter((n: ThongBao) => n.ma_tl !== deletingId);

            // Remove references from other documents
            const newDocuments = prev.documents
                .filter((d: DanhMucTaiLieu) => d.ma_tl !== deletingId)
                .map((doc: DanhMucTaiLieu) => {
                    const updatedDoc = { ...doc };
                    if (updatedDoc.ma_tl_cha === deletingId) {
                        updatedDoc.ma_tl_cha = undefined;
                    }
                    if (updatedDoc.tai_lieu_thay_the === deletingId) {
                        updatedDoc.tai_lieu_thay_the = undefined;
                    }
                    return updatedDoc;
                });
                
            // Remove references from audit schedules
            const newAuditSchedules = prev.auditSchedules.map((audit: LichAudit) => {
                if (audit.tai_lieu_lien_quan_ids?.includes(deletingId)) {
                    return {
                        ...audit,
                        tai_lieu_lien_quan_ids: audit.tai_lieu_lien_quan_ids.filter(id => id !== deletingId)
                    };
                }
                return audit;
            });

            return {
                ...prev,
                documents: newDocuments,
                versions: newVersions,
                changeLogs: newChangeLogs,
                distributions: newDistributions,
                reviewSchedules: newReviewSchedules,
                trainings: newTrainings,
                risks: newRisks,
                auditTrail: newAuditTrail,
                notifications: newNotifications,
                auditSchedules: newAuditSchedules,
            };
        });

        setDeletingId(null);
    };
    
    const deletionInfo = useMemo(() => {
        if (!deletingId) return { title: 'Xác nhận Xóa', message: '' };
        const doc = allData.documents.find(d => d.ma_tl === deletingId);
        return {
            title: 'Xác nhận Xóa Tài liệu',
            message: `Bạn có chắc chắn muốn xóa tài liệu '${doc?.ten_tai_lieu || ''}' không? Hành động này không thể hoàn tác.`
        };
    }, [deletingId, allData.documents]);

    const handlePrint = () => window.print();

    const handleExportCsv = () => {
        const dataToExport = sortedDocuments.map(doc => ({
            ma_tl: doc.ma_tl,
            ten_tai_lieu: doc.ten_tai_lieu,
            so_hieu: doc.so_hieu,
            phien_ban: latestVersionMap.get(doc.ma_tl) || 'N/A',
            loai_tai_lieu: loaiTaiLieuMap.get(doc.loai_tai_lieu) || '',
            phong_ban_quan_ly: phongBanMap.get(doc.phong_ban_quan_ly) || '',
            trang_thai: translate(doc.trang_thai),
            ngay_hieu_luc: formatDateForDisplay(doc.ngay_hieu_luc),
            ngay_het_hieu_luc: formatDateForDisplay(doc.ngay_het_hieu_luc),
        }));

        const headers = {
            ma_tl: 'Mã Tài liệu',
            ten_tai_lieu: 'Tên Tài liệu',
            so_hieu: 'Số hiệu',
            phien_ban: 'Phiên bản',
            loai_tai_lieu: 'Loại Tài liệu',
            phong_ban_quan_ly: 'Phòng ban',
            trang_thai: 'Trạng thái',
            ngay_hieu_luc: 'Ngày hiệu lực',
            ngay_het_hieu_luc: 'Ngày hết hiệu lực',
        };

        exportToCsv(dataToExport, headers, 'danh_sach_tai_lieu.csv');
    };

    const handleExportWord = () => {
        exportVisibleReportToWord('danh_sach_tai_lieu');
    };

    const getRowClassName = (doc: DanhMucTaiLieu) => {
        if (doc.trang_thai === DocumentStatus.HET_HIEU_LUC) {
            return 'italic text-gray-500';
        }
        return '';
    };

    const renderActions = (doc: DanhMucTaiLieu) => (
        <div className="flex items-center justify-end space-x-3">
             <button
                onClick={(e) => { e.stopPropagation(); handleOpenRelatedModal(doc); }}
                className="text-gray-500 hover:text-gray-800"
                title="Xem tài liệu liên quan"
            >
                <Icon type="link" className="h-5 w-5" />
            </button>
            {canUpdate && (
                <button 
                    onClick={(e) => { e.stopPropagation(); openModal(doc); }} 
                    className="text-blue-600 hover:text-blue-800" 
                    title="Chỉnh sửa"
                >
                    <Icon type="pencil" className="h-5 w-5" />
                </button>
            )}
            {canDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setDeletingId(doc.ma_tl); }} 
                    className="text-red-600 hover:text-red-800" 
                    title="Xóa"
                >
                    <Icon type="trash" className="h-5 w-5" />
                </button>
            )}
        </div>
    );

    const tableColumns = [
        { 
            header: <Icon type="star" className="h-5 w-5 text-gray-500 mx-auto" />,
            accessor: (item: DanhMucTaiLieu) => (
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.ma_tl); }}
                    className="p-1 rounded-full hover:bg-yellow-100 flex items-center justify-center w-full"
                    title={item.is_bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                >
                    <Icon 
                        type={item.is_bookmarked ? 'star-solid' : 'star'} 
                        className={`h-5 w-5 ${item.is_bookmarked ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} 
                    />
                </button>
            ),
            className: 'w-12 text-center'
        },
        { header: getSortableHeader('Mã', 'ma_tl'), accessor: (item: DanhMucTaiLieu) => item.ma_tl, className: 'w-28' },
        { header: getSortableHeader('Tên tài liệu', 'ten_tai_lieu'), accessor: (item: DanhMucTaiLieu) => item.ten_tai_lieu, className: 'font-medium text-gray-900 min-w-[20rem]' },
        { header: getSortableHeader('Số hiệu', 'so_hieu'), accessor: (item: DanhMucTaiLieu) => item.so_hieu, className: 'w-32' },
        { header: getSortableHeader('Phiên bản', 'phien_ban'), accessor: (item: DanhMucTaiLieu) => latestVersionMap.get(item.ma_tl) || 'N/A', className: 'w-24 text-center' },
        { header: getSortableHeader('Trạng thái', 'trang_thai'), accessor: (item: DanhMucTaiLieu) => <Badge status={item.trang_thai} />, className: 'w-40' },
        { header: getSortableHeader('Phòng ban', 'phong_ban_quan_ly'), accessor: (item: DanhMucTaiLieu) => phongBanMap.get(item.phong_ban_quan_ly), className: 'w-48' },
        { 
            header: getSortableHeader('Ngày hiệu lực', 'ngay_hieu_luc'), 
            accessor: (item: DanhMucTaiLieu) => formatDateForDisplay(item.ngay_hieu_luc),
            className: 'w-36 text-center'
        },
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
        },
    ];

    return (
        <>
            {printLayoutProps && <PrintReportLayout {...printLayoutProps} currentUser={currentUser} />}
            <div className="space-y-6 no-print">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý tài liệu</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Tìm kiếm, lọc và quản lý tất cả các tài liệu trong hệ thống.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-x-2">
                        <ExportDropdown 
                            onPrint={handlePrint}
                            onExportCsv={handleExportCsv}
                            onExportWord={handleExportWord}
                        />
                        {canCreate && (
                            <button
                                type="button"
                                onClick={() => openModal()}
                                className="btn-primary"
                            >
                                <Icon type="plus" className="-ml-1 mr-2 h-5 w-5" />
                                Thêm Tài liệu
                            </button>
                        )}
                    </div>
                </div>

                <Card>
                    <Card.Body>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end">
                            <div className="xl:col-span-2">
                                <label htmlFor="search-input" className="form-label">Tìm kiếm</label>
                                <div className="search-input-container">
                                    <Icon type="search" className="search-input-icon h-5 w-5" />
                                    <input
                                        id="search-input"
                                        type="text"
                                        placeholder="Tên, mã, số hiệu..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input search-input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="status-filter" className="form-label">Trạng thái</label>
                                <select
                                    id="status-filter"
                                    value={filters.status}
                                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as DocumentStatus | '' | 'all_docs' }))}
                                    className="form-select"
                                >
                                    <option value="">Tài liệu đang dùng</option>
                                    <option value="all_docs">Tất cả</option>
                                    {Object.values(DocumentStatus).map(s => <option key={s} value={s}>{translate(s)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="department-filter" className="form-label">Phòng ban</label>
                                <select
                                    id="department-filter"
                                    value={filters.department}
                                    onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}
                                    className="form-select"
                                >
                                    <option value="">Tất cả</option>
                                    {allData.phongBan.map(d => <option key={d.id} value={d.id}>{d.ten}</option>)}
                                </select>
                            </div>
                           <div>
                                <label htmlFor="standard-filter" className="form-label">Tiêu chuẩn</label>
                                <select
                                    id="standard-filter"
                                    value={filters.standard}
                                    onChange={(e) => setFilters(f => ({ ...f, standard: e.target.value }))}
                                    className="form-select"
                                >
                                    <option value="">Tất cả</option>
                                    {allData.tieuChuan.filter(s => s.is_active).map(s => {
                                        const versionPart = s.phien_ban ? `v${s.phien_ban}` : '';
                                        const detailsPart = [s.ten_viet_tat, versionPart].filter(Boolean).join(' ');
                                        const displayText = detailsPart ? `${s.ten} (${detailsPart})` : s.ten;
                                        return <option key={s.id} value={s.id}>{displayText}</option>;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="bookmark-toggle" className="form-label">&nbsp;</label>
                                <button
                                    id="bookmark-toggle"
                                    type="button"
                                    onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                                    className={`w-full inline-flex items-center justify-center gap-x-1.5 rounded-md border shadow-sm transition-colors duration-150 py-2.5 px-4 text-sm font-medium ${
                                        showBookmarkedOnly
                                            ? 'bg-yellow-100 text-yellow-900 border-yellow-400 hover:bg-yellow-200'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon 
                                        type={showBookmarkedOnly ? 'star-solid' : 'star'} 
                                        className={`-ml-0.5 h-5 w-5 ${showBookmarkedOnly ? 'text-yellow-500' : 'text-gray-400'}`} 
                                    />
                                    <span>Đã đánh dấu</span>
                                </button>
                            </div>
                        </div>
                    </Card.Body>
                    <Table<DanhMucTaiLieu>
                        columns={tableColumns}
                        data={paginatedDocuments}
                        onRowClick={onViewDetails}
                        rowClassName={getRowClassName}
                        actions={renderActions}
                    />
                    {sortedDocuments.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        >
                            <div className="flex items-center gap-x-4">
                                <p className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                    - <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedDocuments.length)}</span>
                                    {' '}trên <span className="font-medium">{sortedDocuments.length}</span> tài liệu
                                </p>

                                <div className="flex items-center gap-2">
                                    <label htmlFor="items-per-page" className="text-sm text-gray-700">Hiển thị:</label>
                                    <select
                                        id="items-per-page"
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="form-select py-1 w-auto"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <span className="text-sm text-gray-700">dòng/trang</span>
                                </div>
                            </div>
                        </Pagination>
                    )}
                </Card>

                <Modal isOpen={isModalOpen} onClose={closeModal} title={editingDocument ? 'Chỉnh sửa Tài liệu' : 'Thêm mới Tài liệu'}>
                    <DocumentForm
                        id="document-form"
                        onSubmit={handleSave}
                        initialData={editingDocument}
                        documents={allData.documents}
                        categories={{
                            nhanSu: allData.nhanSu,
                            phongBan: allData.phongBan,
                            loaiTaiLieu: allData.loaiTaiLieu,
                            capDoTaiLieu: allData.capDoTaiLieu,
                            mucDoBaoMat: allData.mucDoBaoMat,
                            tieuChuan: allData.tieuChuan,
                        }}
                    />
                    <Modal.Footer>
                        <button type="button" onClick={closeModal} className="btn-secondary">Hủy</button>
                        <button 
                            type="submit" 
                            form="document-form"
                            className="ml-3 btn-primary"
                        >
                            Lưu
                        </button>
                    </Modal.Footer>
                </Modal>
                
                <Modal 
                    isOpen={!!relatedDoc} 
                    onClose={() => setRelatedDoc(null)} 
                    title={`Tài liệu liên quan cho: ${relatedDoc?.ten_tai_lieu || ''}`}
                >
                    {relatedDoc && relatedDocsData && (
                        <RelatedDocumentsView 
                            selectedDoc={relatedDoc}
                            relatedData={relatedDocsData}
                            onViewDetailsClick={handleNavigateFromModal}
                        />
                    )}
                </Modal>

                <ConfirmationDialog
                    isOpen={!!deletingId}
                    onClose={() => setDeletingId(null)}
                    onConfirm={handleDelete}
                    title={deletionInfo.title}
                    message={deletionInfo.message}
                />
            </div>
        </>
    );
};

export default DocumentManagementPage;