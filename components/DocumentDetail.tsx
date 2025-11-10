

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { 
    DanhMucTaiLieu, PhienBanTaiLieu, NhatKyThayDoi, PhanPhoiTaiLieu, LichRaSoat, DaoTaoTruyenThong, RuiRoCoHoi, NhanSu, PhongBan, LoaiTaiLieu, CapDoTaiLieu, MucDoBaoMat, TanSuatRaSoat, HangMucThayDoi, AuditLog, TieuChuan
} from '../types';
import { DocumentStatus, VersionStatus, AuditAction, ReviewResult } from '../constants';
import { Icon } from './ui/Icon';
import Badge from './ui/Badge';
import Card from './ui/Card';
import Tabs from './ui/Tabs';
import Table from './ui/Table';
import Modal from './ui/Modal';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { translate } from '../utils/translations';
import { formatDateForDisplay, formatDateTimeForDisplay } from '../utils/dateUtils';
import Pagination from './ui/Pagination';
import DocumentSelectorModal from './ui/DocumentSelectorModal';

// Import Forms
import VersionForm from './forms/VersionForm';
import ChangeLogForm from './forms/ChangeLogForm';
import DistributionForm from './forms/DistributionForm';
import ReviewScheduleForm from './forms/ReviewScheduleForm';
import TrainingForm from './forms/TrainingForm';
import RiskForm from './forms/RiskForm';
import DocumentForm from './forms/DocumentForm';

// Helper function to find all descendants of a document
const getDescendantIds = (docId: string, allDocs: DanhMucTaiLieu[]): Set<string> => {
    const descendants = new Set<string>();
    const queue: string[] = [docId];
    const visited = new Set<string>([docId]);

    let head = 0;
    while(head < queue.length) {
        const currentParentId = queue[head];
        head++;

        for (const doc of allDocs) {
            if (doc.ma_tl_cha === currentParentId && !visited.has(doc.ma_tl)) {
                descendants.add(doc.ma_tl);
                visited.add(doc.ma_tl);
                queue.push(doc.ma_tl);
            }
        }
    }
    return descendants;
};


// A simple component to display details in a list
const DetailItem: React.FC<{ label: string; value?: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth = false }) => {
    if (!value && typeof value !== 'string' && typeof value !== 'number') return null;
    return (
        <div className={fullWidth ? 'col-span-2' : ''}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value}</dd>
        </div>
    );
};

const RelationshipItem: React.FC<{
    label: string;
    doc: DanhMucTaiLieu | null;
    canUpdate: boolean;
    onAdd: () => void;
    onRemove: () => void;
}> = ({ label, doc, canUpdate, onAdd, onRemove }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 flex items-center justify-between">
            {doc ? (
                <span className="truncate pr-4">{`${doc.ten_tai_lieu} (${doc.ma_tl})`}</span>
            ) : (
                <span className="text-gray-400">Không có</span>
            )}
            {canUpdate && (
                <div className="flex-shrink-0 flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={onAdd}
                        className="text-blue-600 hover:text-blue-800"
                        title={doc ? 'Thay đổi' : 'Thêm'}
                    >
                        <Icon type="pencil" className="h-4 w-4" />
                    </button>
                    {doc && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa liên kết"
                        >
                            <Icon type="x-mark" className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
        </dd>
    </div>
);


type AllData = {
    documents: DanhMucTaiLieu[];
    versions: PhienBanTaiLieu[];
    changeLogs: NhatKyThayDoi[];
    distributions: PhanPhoiTaiLieu[];
    reviewSchedules: LichRaSoat[];
    trainings: DaoTaoTruyenThong[];
    risks: RuiRoCoHoi[];
    auditTrail: AuditLog[];
    nhanSu: NhanSu[];
    phongBan: PhongBan[];
    loaiTaiLieu: LoaiTaiLieu[];
    capDoTaiLieu: CapDoTaiLieu[];
    mucDoBaoMat: MucDoBaoMat[];
    tanSuatRaSoat: TanSuatRaSoat[];
    hangMucThayDoi: HangMucThayDoi[];
    tieuChuan: TieuChuan[];
};

interface DocumentDetailProps {
    document: DanhMucTaiLieu;
    allData: AllData;
    onBack: () => void;
    onSaveRelatedData: (type: string, data: any) => void;
    onDeleteRelatedData: (type: string, data: any) => void;
    onUpdateDocument: (document: DanhMucTaiLieu) => void;
    onUpdateVersionStatus: (versionId: string, newStatus: VersionStatus) => void;
    onToggleBookmark: (docId: string) => void;
    currentUser: NhanSu;
}

type ModalType = 'versions' | 'changeLogs' | 'distributions' | 'reviewSchedules' | 'trainings' | 'risks' | 'viewChangeLog';

type ModalContent = {
    type: ModalType;
    data?: any;
};

const idKeyMap: Record<ModalType, string> = {
    versions: 'id_phien_ban',
    changeLogs: 'id_thay_doi',
    distributions: 'id_phan_phoi',
    reviewSchedules: 'id_lich',
    trainings: 'id_dt',
    risks: 'id_rr',
    viewChangeLog: 'id_thay_doi'
};

const AUDIT_ITEMS_PER_PAGE = 10;

const TabContentWrapper: React.FC<{
    title: string;
    children: React.ReactNode;
    buttonLabel?: string;
    onButtonClick?: () => void;
    showButton?: boolean;
}> = ({ title, children, buttonLabel, onButtonClick, showButton = false }) => (
    <Card className="mt-6">
        <Card.Header className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {showButton && buttonLabel && onButtonClick && (
                <button
                    type="button"
                    onClick={onButtonClick}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none no-print"
                >
                    <Icon type="plus" className="-ml-1 mr-2 h-4 w-4" />
                    {buttonLabel}
                </button>
            )}
        </Card.Header>
        <Card.Body>
            {children}
        </Card.Body>
    </Card>
);

const DocumentDetail: React.FC<DocumentDetailProps> = ({
    document, allData, onBack, onSaveRelatedData, onDeleteRelatedData, onUpdateDocument, onUpdateVersionStatus, onToggleBookmark, currentUser
}) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ type: ModalType; data: any } | null>(null);
    const [isEditingDocument, setIsEditingDocument] = useState(false);
    const [selectorModalType, setSelectorModalType] = useState<'parent' | 'replacement' | null>(null);
    const [auditPage, setAuditPage] = useState(1);
    
    const canUpdateDocument = currentUser.role === 'admin' || !!currentUser.permissions?.canUpdate;
    const canDeleteDocument = currentUser.role === 'admin' || !!currentUser.permissions?.canDelete;

    const handlePrint = () => {
        // If a PDF link exists, open it in a new tab for the browser's PDF viewer to handle printing.
        // This is more intuitive for users than printing the entire web page.
        if (document.file_pdf) {
            window.open(document.file_pdf, '_blank');
        } else {
            // Otherwise, fall back to printing the current detail page, which is formatted for printing via CSS.
            window.print();
        }
    };

    const potentialParentDocuments = useMemo(() => {
        const descendantIds = getDescendantIds(document.ma_tl, allData.documents);
        const forbiddenIds = new Set([document.ma_tl, ...descendantIds]);
        return allData.documents.filter(doc => !forbiddenIds.has(doc.ma_tl));
    }, [allData.documents, document.ma_tl]);
    
    const {
        nhanSuMap, loaiTaiLieuMap, capDoMap, mucDoBaoMatMap, phongBanMap, hangMucMap, tanSuatMap, tieuChuanMap
    } = useMemo(() => ({
        nhanSuMap: new Map(allData.nhanSu.filter(Boolean).map(ns => [ns.id, ns.ten])),
        loaiTaiLieuMap: new Map(allData.loaiTaiLieu.filter(Boolean).map(c => [c.id, c.ten])),
        capDoMap: new Map(allData.capDoTaiLieu.filter(Boolean).map(c => [c.id, c.ten])),
        mucDoBaoMatMap: new Map(allData.mucDoBaoMat.filter(Boolean).map(c => [c.id, c.ten])),
        phongBanMap: new Map(allData.phongBan.filter(Boolean).map(c => [c.id, c.ten])),
        hangMucMap: new Map(allData.hangMucThayDoi.filter(Boolean).map(c => [c.id, c.ten])),
        tanSuatMap: new Map(allData.tanSuatRaSoat.filter(Boolean).map(c => [c.id, c.ten])),
        tieuChuanMap: new Map(allData.tieuChuan.filter(Boolean).map(c => [c.id, c.ten])),
    }), [allData]);

    const relatedData = useMemo(() => ({
        versions: allData.versions.filter(v => v.ma_tl === document.ma_tl).sort((a,b) => String(b.phien_ban).localeCompare(String(a.phien_ban), undefined, {numeric: true})),
        changeLogs: allData.changeLogs.filter(cl => allData.versions.some(v => v.ma_tl === document.ma_tl && v.id_phien_ban === cl.id_phien_ban)).sort((a,b) => new Date(b.ngay_de_xuat).getTime() - new Date(a.ngay_de_xuat).getTime()),
        distributions: allData.distributions.filter(d => allData.versions.some(v => v.ma_tl === document.ma_tl && v.id_phien_ban === d.id_phien_ban)).sort((a,b) => new Date(b.ngay_phan_phoi).getTime() - new Date(a.ngay_phan_phoi).getTime()),
        reviewSchedules: allData.reviewSchedules.filter(rs => rs.ma_tl === document.ma_tl).sort((a,b) => new Date(b.ngay_ra_soat_ke_tiep).getTime() - new Date(a.ngay_ra_soat_ke_tiep).getTime()),
        trainings: allData.trainings.filter(t => t.ma_tl === document.ma_tl).sort((a,b) => new Date(b.ngay_dao_tao).getTime() - new Date(a.ngay_dao_tao).getTime()),
        risks: allData.risks.filter(r => r.ma_tl === document.ma_tl).sort((a,b) => new Date(b.ngay_nhan_dien).getTime() - new Date(a.ngay_nhan_dien).getTime()),
        auditTrail: allData.auditTrail.filter(log => log.ma_tl === document.ma_tl).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    }), [document.ma_tl, allData]);

    const openModal = (type: ModalType, data: any = null) => setModalContent({ type, data });
    const closeModal = () => setModalContent(null);
    const openConfirm = (type: ModalType, data: any) => setConfirmDialog({ type, data });
    const closeConfirm = () => setConfirmDialog(null);

    const handleDelete = () => {
        if (confirmDialog) {
            onDeleteRelatedData(confirmDialog.type, confirmDialog.data);
            closeConfirm();
        }
    };
    
    const handleSave = (formData: any) => {
        if(modalContent) {
            onSaveRelatedData(modalContent.type, formData);
        }
    };

    const handleRelationshipChange = (type: 'parent' | 'replacement', docId: string) => {
        const field = type === 'parent' ? 'ma_tl_cha' : 'tai_lieu_thay_the';
        onUpdateDocument({ ...document, [field]: docId });
        setSelectorModalType(null);
    };

    const handleRemoveRelationship = (type: 'parent' | 'replacement') => {
        const field = type === 'parent' ? 'ma_tl_cha' : 'tai_lieu_thay_the';
        onUpdateDocument({ ...document, [field]: undefined });
    };

    const handleSaveDocument = (updatedDoc: DanhMucTaiLieu) => {
        onUpdateDocument(updatedDoc);
        setIsEditingDocument(false);
    };

    const getModalTitle = () => {
        if (!modalContent) return '';
        const isEditing = !!modalContent.data;

        if (modalContent.type === 'viewChangeLog') {
            return 'Chi tiết Thay đổi';
        }

        const prefix = isEditing ? 'Chỉnh sửa' : 'Thêm';
        // Special case for 'changeLogs' to be more user-friendly
        const entityName = modalContent.type === 'changeLogs' ? 'Thay đổi' : translate(modalContent.type);
        return `${prefix} ${entityName}`;
    };

    const renderModalContent = () => {
        if (!modalContent) return null;
        const handleSaveAndClose = (formData: any) => {
            onSaveRelatedData(modalContent.type, formData);
            closeModal();
        };

        switch (modalContent.type) {
            case 'versions':
                return <VersionForm onSubmit={handleSaveAndClose} onCancel={closeModal} initialData={modalContent.data} ma_tl={document.ma_tl} nhanSuList={allData.nhanSu} />;
            case 'changeLogs':
                return <ChangeLogForm onSubmit={handleSaveAndClose} onCancel={closeModal} initialData={modalContent.data} versions={relatedData.versions} nhanSuList={allData.nhanSu} hangMucList={allData.hangMucThayDoi} />;
            case 'distributions':
                return <DistributionForm onSubmit={handleSaveAndClose} onCancel={closeModal} initialData={modalContent.data} versions={relatedData.versions} phongBanList={allData.phongBan} nhanSuList={allData.nhanSu} />;
            case 'reviewSchedules':
                return <ReviewScheduleForm onSubmit={handleSaveAndClose} onCancel={closeModal} initialData={modalContent.data} ma_tl={document.ma_tl} nhanSuList={allData.nhanSu} tanSuatList={allData.tanSuatRaSoat} />;
            case 'trainings':
                return <TrainingForm 
                            onSubmit={handleSaveAndClose} 
                            onCancel={closeModal} 
                            initialData={modalContent.data} 
                            ma_tl={document.ma_tl}
                            nhanSuList={allData.nhanSu}
                            phongBanList={allData.phongBan}
                        />;
            case 'risks':
                return <RiskForm onSubmit={handleSaveAndClose} onCancel={closeModal} initialData={modalContent.data} ma_tl={document.ma_tl} nhanSuList={allData.nhanSu} />;
            case 'viewChangeLog': {
                const data = modalContent.data as NhatKyThayDoi;
                if (!data) return null;
                const version = relatedData.versions.find(v => v.id_phien_ban === data.id_phien_ban);
                return (
                    <div>
                        <div className="p-6 space-y-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-4">
                                <DetailItem label="Phiên bản" value={version?.phien_ban} />
                                <DetailItem label="Hạng mục" value={hangMucMap.get(data.hang_muc)} />
                                <DetailItem label="Ngày đề xuất" value={formatDateForDisplay(data.ngay_de_xuat)} />
                                <DetailItem label="Người đề xuất" value={nhanSuMap.get(data.nguoi_de_xuat)} />
                            </dl>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lý do thay đổi</label>
                                <p className="mt-1 text-sm text-gray-900 bg-slate-50 p-3 rounded-md border border-slate-200">{data.ly_do_thay_doi}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nội dung trước</label>
                                    <pre className="mt-1 text-sm text-gray-900 bg-red-50 p-3 rounded-md border border-red-200 whitespace-pre-wrap font-sans h-48 overflow-y-auto">{data.noi_dung_truoc || 'Không có'}</pre>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nội dung sau</label>
                                    <pre className="mt-1 text-sm text-gray-900 bg-green-50 p-3 rounded-md border border-green-200 whitespace-pre-wrap font-sans h-48 overflow-y-auto">{data.noi_dung_sau || 'Không có'}</pre>
                                </div>
                            </div>
                        </div>
                        <Modal.Footer>
                            <button type="button" onClick={closeModal} className="btn-secondary">Đóng</button>
                        </Modal.Footer>
                    </div>
                );
            }
            default: return null;
        }
    };

    const confirmationMessages = {
        versions: "Bạn có chắc chắn muốn xóa phiên bản này không?",
        changeLogs: "Bạn có chắc chắn muốn xóa nhật ký thay đổi này không?",
        distributions: "Bạn có chắc chắn muốn xóa lịch sử phân phối này không?",
        reviewSchedules: "Bạn có chắc chắn muốn xóa lịch rà soát này không?",
        trainings: "Bạn có chắc chắn muốn xóa buổi đào tạo này không?",
        risks: "Bạn có chắc chắn muốn xóa rủi ro/cơ hội này không?",
    };
    
    const renderVersionActions = (item: PhienBanTaiLieu) => {
        const isApprover = document.nguoi_phe_duyet === currentUser.id || currentUser.role === 'admin';
        const isEditor = document.nguoi_soan_thao === currentUser.id || document.nguoi_ra_soat === currentUser.id || currentUser.role === 'admin';
    
        return (
            <div className="flex items-center justify-end space-x-2">
                {item.trang_thai_phien_ban === VersionStatus.BAN_THAO && isEditor && (
                    <button onClick={(e) => { e.stopPropagation(); onUpdateVersionStatus(item.id_phien_ban, VersionStatus.PHE_DUYET); }} className="btn-secondary px-2 py-1 text-xs" title="Gửi phê duyệt">
                        <Icon type="paper-airplane" className="h-4 w-4"/>
                    </button>
                )}
                {item.trang_thai_phien_ban === VersionStatus.PHE_DUYET && isApprover && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onUpdateVersionStatus(item.id_phien_ban, VersionStatus.BAN_HANH); }} className="btn-primary px-2 py-1 text-xs" title="Phê duyệt & Ban hành">
                            <Icon type="check-circle" className="h-4 w-4"/>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onUpdateVersionStatus(item.id_phien_ban, VersionStatus.BAN_THAO); }} className="btn-secondary px-2 py-1 text-xs" title="Yêu cầu chỉnh sửa">
                            <Icon type="arrow-uturn-left" className="h-4 w-4"/>
                        </button>
                    </>
                )}
    
                {canUpdateDocument && (
                    <button onClick={(e) => { e.stopPropagation(); openModal('versions', item); }} className="p-1 text-blue-600 hover:text-blue-800" title="Chỉnh sửa chi tiết">
                        <Icon type="pencil" className="h-4 w-4" />
                    </button>
                )}
                {canDeleteDocument && (
                    <button onClick={(e) => { e.stopPropagation(); openConfirm('versions', item); }} className="p-1 text-red-600 hover:text-red-800" title="Xóa">
                        <Icon type="trash" className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    };

    const paginatedAuditTrail = relatedData.auditTrail.slice((auditPage - 1) * AUDIT_ITEMS_PER_PAGE, auditPage * AUDIT_ITEMS_PER_PAGE);

    const tabs = [
        { title: `Nhật ký Thay đổi (${relatedData.changeLogs.length})`, content: (
             <TabContentWrapper title="Chi tiết Thay đổi" buttonLabel="Thêm Thay đổi" onButtonClick={() => openModal('changeLogs')} showButton={canUpdateDocument}>
                <Table<NhatKyThayDoi> 
                    columns={[
                        { header: 'Phiên bản', accessor: item => relatedData.versions.find(v => v.id_phien_ban === item.id_phien_ban)?.phien_ban },
                        { header: 'Hạng mục', accessor: item => hangMucMap.get(item.hang_muc) },
                        { header: 'Lý do', accessor: item => <p className="truncate max-w-xs">{item.ly_do_thay_doi}</p> },
                        { header: 'Ngày đề xuất', accessor: item => formatDateForDisplay(item.ngay_de_xuat) },
                        { header: 'Người đề xuất', accessor: item => nhanSuMap.get(item.nguoi_de_xuat) },
                    ]} 
                    data={relatedData.changeLogs} 
                    actions={item => (
                        <div className="flex items-center justify-end space-x-2">
                            <button onClick={(e) => { e.stopPropagation(); openModal('viewChangeLog', item); }} className="p-1 text-gray-500 hover:text-gray-800" title="Xem chi tiết thay đổi">
                                <Icon type="eye" className="h-5 w-5" />
                            </button>
                            {canUpdateDocument && (
                                <button onClick={(e) => { e.stopPropagation(); openModal('changeLogs', item); }} className="p-1 text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
                                    <Icon type="pencil" className="h-4 w-4" />
                                </button>
                            )}
                            {canDeleteDocument && (
                                <button onClick={(e) => { e.stopPropagation(); openConfirm('changeLogs', item); }} className="p-1 text-red-600 hover:text-red-800" title="Xóa">
                                    <Icon type="trash" className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                />
            </TabContentWrapper>
        )},
        { title: `Phân phối (${relatedData.distributions.length})`, content: (
            <TabContentWrapper title="Lịch sử Phân phối" buttonLabel="Thêm Phân phối" onButtonClick={() => openModal('distributions')} showButton={canUpdateDocument}>
                <Table<PhanPhoiTaiLieu> columns={[
                    { header: 'Phiên bản', accessor: item => relatedData.versions.find(v => v.id_phien_ban === item.id_phien_ban)?.phien_ban },
                    { header: 'Phòng ban nhận', accessor: item => phongBanMap.get(item.phong_ban_nhan) },
                    { header: 'Ngày phân phối', accessor: item => formatDateForDisplay(item.ngay_phan_phoi) },
                    { header: 'Bản cứng/mềm', accessor: item => `${item.so_luong_ban_cung}/${item.so_luong_ban_mem}` },
                    { header: 'Trạng thái', accessor: item => <Badge status={item.trang_thai_phan_phoi} /> },
                ]} data={relatedData.distributions} actions={canUpdateDocument ? item => (
                     <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModal('distributions', item)} className="text-blue-600 hover:text-blue-800"><Icon type="pencil" className="h-4 w-4" /></button>
                        <button onClick={() => openConfirm('distributions', item)} className="text-red-600 hover:text-red-800"><Icon type="trash" className="h-4 w-4" /></button>
                    </div>
                ) : undefined}/>
            </TabContentWrapper>
        )},
        { title: `Lịch Rà soát (${relatedData.reviewSchedules.length})`, content: (
            <TabContentWrapper title="Kế hoạch và Kết quả Rà soát" buttonLabel="Thêm Lịch" onButtonClick={() => openModal('reviewSchedules')} showButton={canUpdateDocument}>
                 <Table<LichRaSoat> columns={[
                    { header: 'Ngày rà soát kế tiếp', accessor: item => formatDateForDisplay(item.ngay_ra_soat_ke_tiep) },
                    { header: 'Tần suất', accessor: item => tanSuatMap.get(item.tan_suat) },
                    { header: 'Người chịu trách nhiệm', accessor: item => nhanSuMap.get(item.nguoi_chiu_trach_nhiem) },
                    { header: 'Ngày thực tế', accessor: item => formatDateForDisplay(item.ngay_ra_soat_thuc_te) },
                    { header: 'Kết quả', accessor: item => item.ket_qua_ra_soat ? <Badge status={item.ket_qua_ra_soat} /> : '' },
                ]} data={relatedData.reviewSchedules} actions={canUpdateDocument ? item => (
                     <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModal('reviewSchedules', item)} className="text-blue-600 hover:text-blue-800"><Icon type="pencil" className="h-4 w-4" /></button>
                        <button onClick={() => openConfirm('reviewSchedules', item)} className="text-red-600 hover:text-red-800"><Icon type="trash" className="h-4 w-4" /></button>
                    </div>
                ) : undefined}/>
            </TabContentWrapper>
        )},
        { title: `Đào tạo & TT (${relatedData.trainings.length})`, content: (
             <TabContentWrapper title="Hoạt động Đào tạo & Truyền thông" buttonLabel="Thêm Đào tạo" onButtonClick={() => openModal('trainings')} showButton={canUpdateDocument}>
                 <Table<DaoTaoTruyenThong> columns={[
                    { header: 'Nội dung', accessor: 'noi_dung_dao_tao' },
                    { header: 'Ngày đào tạo', accessor: item => formatDateForDisplay(item.ngay_dao_tao) },
                    { header: 'Người đào tạo', accessor: item => nhanSuMap.get(item.nguoi_dao_tao) },
                    { header: 'Số người', accessor: 'so_nguoi_tham_gia' },
                ]} data={relatedData.trainings} actions={canUpdateDocument ? item => (
                     <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModal('trainings', item)} className="text-blue-600 hover:text-blue-800"><Icon type="pencil" className="h-4 w-4" /></button>
                        <button onClick={() => openConfirm('trainings', item)} className="text-red-600 hover:text-red-800"><Icon type="trash" className="h-4 w-4" /></button>
                    </div>
                ) : undefined}/>
            </TabContentWrapper>
        )},
        { title: `Rủi ro & Cơ hội (${relatedData.risks.length})`, content: (
            <TabContentWrapper title="Quản lý Rủi ro & Cơ hội" buttonLabel="Thêm Rủi ro/Cơ hội" onButtonClick={() => openModal('risks')} showButton={canUpdateDocument}>
                 <Table<RuiRoCoHoi> columns={[
                    { header: 'Loại', accessor: item => item.loai === 'rui_ro' ? 'Rủi ro' : 'Cơ hội' },
                    { header: 'Mô tả', accessor: 'mo_ta' },
                    { header: 'Ngày nhận diện', accessor: item => formatDateForDisplay(item.ngay_nhan_dien) },
                    { header: 'Người phụ trách', accessor: item => nhanSuMap.get(item.nguoi_phu_trach) },
                    { header: 'Trạng thái', accessor: item => <Badge status={item.trang_thai} /> },
                ]} data={relatedData.risks} actions={canUpdateDocument ? item => (
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModal('risks', item)} className="text-blue-600 hover:text-blue-800"><Icon type="pencil" className="h-4 w-4" /></button>
                        <button onClick={() => openConfirm('risks', item)} className="text-red-600 hover:text-red-800"><Icon type="trash" className="h-4 w-4" /></button>
                    </div>
                ) : undefined}/>
            </TabContentWrapper>
        )},
        { title: `Nhật ký Hệ thống (${relatedData.auditTrail.length})`, content: (
             <TabContentWrapper title="Lịch sử thay đổi hệ thống">
                <Table<AuditLog> columns={[
                    { header: 'Thời gian', accessor: item => formatDateTimeForDisplay(item.timestamp) },
                    { header: 'Người dùng', accessor: item => nhanSuMap.get(item.user_id) },
                    { header: 'Hành động', accessor: item => <Badge status={item.action} /> },
                    { header: 'Chi tiết', accessor: 'details' },
                ]} data={paginatedAuditTrail} />
                 <Pagination
                    currentPage={auditPage}
                    totalPages={Math.ceil(relatedData.auditTrail.length / AUDIT_ITEMS_PER_PAGE)}
                    onPageChange={setAuditPage}
                />
            </TabContentWrapper>
        )},
    ];

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 no-print">
                    <Icon type="arrow-left" className="h-5 w-5 mr-2" />
                    Quay lại danh sách
                </button>
            </div>
             <Card>
                <Card.Header>
                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-x-3">
                            <button
                                onClick={() => onToggleBookmark(document.ma_tl)}
                                className="p-1 rounded-full hover:bg-yellow-100 mt-1 flex-shrink-0 no-print"
                                title={document.is_bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                            >
                                <Icon
                                    type={document.is_bookmarked ? 'star-solid' : 'star'}
                                    className={`h-6 w-6 ${document.is_bookmarked ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                                />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{document.ten_tai_lieu}</h2>
                                <div className="mt-1 flex items-center space-x-4">
                                   <span className="text-sm text-gray-500">{document.ma_tl} / {document.so_hieu}</span>
                                   <Badge status={document.trang_thai} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 no-print sm:ml-auto">
                             {canUpdateDocument && (
                                <button onClick={() => setIsEditingDocument(true)} className="btn-secondary">Sửa thông tin</button>
                             )}
                              <button onClick={handlePrint} className="btn-secondary" title={document.file_pdf ? "In file PDF" : "In trang này"}>
                                <Icon type="printer" className="-ml-1 mr-2 h-5 w-5" />
                                <span>In</span>
                            </button>
                        </div>
                    </div>
                </Card.Header>
                 <Card.Body>
                     <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-4">
                        <DetailItem label="Loại tài liệu" value={loaiTaiLieuMap.get(document.loai_tai_lieu)} />
                        <DetailItem label="Phòng ban quản lý" value={phongBanMap.get(document.phong_ban_quan_ly)} />
                        <DetailItem label="Cấp độ" value={capDoMap.get(document.cap_do)} />
                        <DetailItem label="Mức độ bảo mật" value={mucDoBaoMatMap.get(document.muc_do_bao_mat)} />
                        <DetailItem label="Ngày ban hành" value={formatDateForDisplay(document.ngay_ban_hanh)} />
                        <DetailItem label="Ngày hiệu lực" value={formatDateForDisplay(document.ngay_hieu_luc)} />
                        <DetailItem label="Ngày hết hiệu lực" value={formatDateForDisplay(document.ngay_het_hieu_luc)} />
                        <DetailItem label="Phiên bản mới nhất" value={relatedData.versions.find(v => v.is_moi_nhat)?.phien_ban} />

                        <div className="sm:col-span-2">
                             <DetailItem label="Tiêu chuẩn áp dụng" value={(document.tieu_chuan_ids || []).map(id => (
                                <span key={id} className="mr-2 inline-block"><Badge status={tieuChuanMap.get(id) || id} size="sm" /></span>
                            ))} />
                        </div>
                        <div className="sm:col-span-2">
                            <RelationshipItem
                                label="Tài liệu cha"
                                doc={allData.documents.find(d => d.ma_tl === document.ma_tl_cha) || null}
                                canUpdate={canUpdateDocument}
                                onAdd={() => setSelectorModalType('parent')}
                                onRemove={() => handleRemoveRelationship('parent')}
                            />
                        </div>
                         <div className="sm:col-span-2">
                              <RelationshipItem
                                label="Thay thế cho tài liệu"
                                doc={allData.documents.find(d => d.ma_tl === document.tai_lieu_thay_the) || null}
                                canUpdate={canUpdateDocument}
                                onAdd={() => setSelectorModalType('replacement')}
                                onRemove={() => handleRemoveRelationship('replacement')}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <DetailItem label="Người soạn thảo" value={nhanSuMap.get(document.nguoi_soan_thao)} />
                        </div>
                         <div className="sm:col-span-2">
                            <DetailItem label="Người rà soát" value={nhanSuMap.get(document.nguoi_ra_soat)} />
                        </div>
                        <div className="sm:col-span-2">
                            <DetailItem label="Người phê duyệt" value={nhanSuMap.get(document.nguoi_phe_duyet)} />
                        </div>
                        
                        <div className="sm:col-span-4">
                             <dt className="text-sm font-medium text-gray-500">File đính kèm</dt>
                             <dd className="mt-1 flex items-center space-x-4">
                                {document.link_drive && <a href={document.link_drive} target="_blank" rel="noopener noreferrer" className="link">Google Drive</a>}
                                {document.file_pdf && <a href={document.file_pdf} target="_blank" rel="noopener noreferrer" className="link">PDF</a>}
                                {document.file_docx && <a href={document.file_docx} target="_blank" rel="noopener noreferrer" className="link">DOCX</a>}
                                {!document.link_drive && !document.file_pdf && !document.file_docx && <span className="text-sm text-gray-400">Không có</span>}
                             </dd>
                        </div>
                     </dl>
                 </Card.Body>
             </Card>
            
            <Card>
                <Card.Header className="flex items-center justify-between">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Lịch sử Phiên bản</h3>
                    {canUpdateDocument && (
                        <button
                            type="button"
                            onClick={() => openModal('versions')}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none no-print"
                        >
                            <Icon type="plus" className="-ml-1 mr-2 h-4 w-4" />
                            Thêm Phiên bản
                        </button>
                    )}
                </Card.Header>
                <Card.Body>
                    <Table<PhienBanTaiLieu>
                        columns={[
                            { header: 'Phiên bản', accessor: (item) => <div className="flex items-center gap-2">{item.phien_ban} {item.is_moi_nhat && <Badge status={VersionStatus.BAN_HANH} size="sm" title="Phiên bản mới nhất đang được ban hành" />}</div> },
                            { header: 'Ngày phát hành', accessor: item => formatDateForDisplay(item.ngay_phat_hanh) },
                            { header: 'Trạng thái', accessor: item => <Badge status={item.trang_thai_phien_ban} /> },
                            { header: 'Tóm tắt thay đổi', accessor: 'tom_tat_thay_doi' },
                            { header: 'Người thực hiện', accessor: item => nhanSuMap.get(item.nguoi_thuc_hien) },
                        ]}
                        data={relatedData.versions}
                        actions={renderVersionActions}
                        onRowClick={(item) => openModal('versions', item)}
                    />
                </Card.Body>
            </Card>

            <div className="print-tabs-container">
                 <Tabs tabs={tabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} />
            </div>

            <Modal isOpen={!!modalContent} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>

            <Modal isOpen={isEditingDocument} onClose={() => setIsEditingDocument(false)} title="Chỉnh sửa thông tin tài liệu">
                 <DocumentForm
                    id="edit-document-form"
                    onSubmit={handleSaveDocument}
                    initialData={document}
                    documents={allData.documents}
                    categories={allData}
                />
                 <Modal.Footer>
                    <button type="button" onClick={() => setIsEditingDocument(false)} className="btn-secondary">Hủy</button>
                    <button type="submit" form="edit-document-form" className="btn-primary ml-3">Lưu thay đổi</button>
                </Modal.Footer>
            </Modal>
            
            <DocumentSelectorModal
                isOpen={!!selectorModalType}
                onClose={() => setSelectorModalType(null)}
                onSelect={(docId) => handleRelationshipChange(selectorModalType!, docId)}
                title={selectorModalType === 'parent' ? 'Chọn Tài liệu cha' : 'Chọn Tài liệu thay thế'}
                // FIX: Pass the correct list of documents to the selector modal.
                documents={selectorModalType === 'parent'
                    ? potentialParentDocuments
                    : allData.documents.filter(d => d.ma_tl !== document.ma_tl)
                }
                currentSelectionId={selectorModalType === 'parent' ? document.ma_tl_cha : document.tai_lieu_thay_the}
            />

            {confirmDialog && (
                <ConfirmationDialog
                    isOpen={!!confirmDialog}
                    onClose={closeConfirm}
                    onConfirm={handleDelete}
                    title={`Xác nhận Xóa ${translate(confirmDialog.type)}`}
                    message={confirmationMessages[confirmDialog.type as keyof typeof confirmationMessages]}
                />
            )}
        </div>
    );
};

export default DocumentDetail;