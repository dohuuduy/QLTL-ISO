import React, { useState, useMemo, useEffect } from 'react';
import type { DanhMucTaiLieu, PhienBanTaiLieu, PhongBan, TieuChuan, ReportType, LichAudit, DanhGiaVien, ToChucDanhGia, NhanSu } from '../types';
import { reportNavItems } from '../constants';
import { formatDateForDisplay } from '../utils/dateUtils';
import { translate } from '../utils/translations';
import { exportReportToCsv, exportVisibleReportToWord } from '../utils/exportUtils';

import Card from './ui/Card';
import Table from './ui/Table';
import Badge from './ui/Badge';
import { Icon } from './ui/Icon';
import ExportDropdown from './ui/ExportDropdown';
import PrintReportLayout from './PrintReportLayout';
import Pagination from './ui/Pagination';

type AllData = {
    documents: DanhMucTaiLieu[];
    versions: PhienBanTaiLieu[];
    phongBan: PhongBan[];
    tieuChuan: TieuChuan[];
    auditSchedules: LichAudit[];
    nhanSu: NhanSu[];
    danhGiaVien: DanhGiaVien[];
    toChucDanhGia: ToChucDanhGia[];
};

interface ReportsPageProps {
  allData: AllData;
  initialReportType: ReportType | null;
  onViewDetails: (doc: DanhMucTaiLieu) => void;
  currentUser: NhanSu;
}

const ReportContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl mt-4">{children}</div>
);

const NoData: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-6 text-center text-gray-500">
        <p>{message}</p>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: React.ReactNode; className?: string }> = ({ label, value, className = '' }) => {
    if (!value && typeof value !== 'string' && typeof value !== 'number') return null;
    return (
        <div className={className}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value}</dd>
        </div>
    );
};

const ReportsPage: React.FC<ReportsPageProps> = ({ allData, initialReportType, onViewDetails, currentUser }) => {
    const [activeReport, setActiveReport] = useState<ReportType>(initialReportType || 'by-department');

    // Filter states
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedStandard, setSelectedStandard] = useState('');
    const [selectedDocumentId, setSelectedDocumentId] = useState('');
    const [expiryDays, setExpiryDays] = useState(30);
    const [includeExpired, setIncludeExpired] = useState(true);
    const [selectedAuditId, setSelectedAuditId] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    useEffect(() => {
        if (initialReportType) {
            setActiveReport(initialReportType);
        }
    }, [initialReportType]);
    
    // Reset page when filters or tabs change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeReport, selectedDepartment, selectedStandard, selectedDocumentId, expiryDays, includeExpired, selectedAuditId, itemsPerPage]);


    const { phongBanMap, tieuChuanMap, latestVersionMap, danhGiaVienMap, toChucDanhGiaMap, nhanSuMap } = useMemo(() => ({
        phongBanMap: new Map(allData.phongBan.filter(Boolean).map(pb => [pb.id, pb.ten])),
        tieuChuanMap: new Map(allData.tieuChuan.filter(Boolean).map(tc => [tc.id, tc.ten])),
        latestVersionMap: new Map(allData.versions.filter(v => v && v.is_moi_nhat).map(v => [v.ma_tl, v.phien_ban])),
        danhGiaVienMap: new Map(allData.danhGiaVien.filter(Boolean).map(dgv => [dgv.id, dgv.ten])),
        toChucDanhGiaMap: new Map(allData.toChucDanhGia.filter(Boolean).map(org => [org.id, org.ten])),
        nhanSuMap: new Map(allData.nhanSu.filter(Boolean).map(ns => [ns.id, ns])),
    }), [allData]);

    // Data processing for each report
    const departmentReportData = useMemo(() => {
        if (!selectedDepartment) return [];
        return allData.documents.filter(doc => doc.phong_ban_quan_ly === selectedDepartment);
    }, [allData.documents, selectedDepartment]);

    const standardReportData = useMemo(() => {
        if (!selectedStandard) return [];
        return allData.documents.filter(doc => doc.tieu_chuan_ids.includes(selectedStandard));
    }, [allData.documents, selectedStandard]);

    const relationshipReportData = useMemo(() => {
        if (!selectedDocumentId) return [];
        const selectedDoc = allData.documents.find(d => d.ma_tl === selectedDocumentId);
        if (!selectedDoc) return [];
        
        const results: { doc: DanhMucTaiLieu, relation: 'parent' | 'self' | 'child' }[] = [];
        
        // Find parent
        if (selectedDoc.ma_tl_cha) {
            const parentDoc = allData.documents.find(d => d.ma_tl === selectedDoc.ma_tl_cha);
            if (parentDoc) results.push({ doc: parentDoc, relation: 'parent' });
        }
        
        // Add self
        results.push({ doc: selectedDoc, relation: 'self' });
        
        // Find children
        const childDocs = allData.documents.filter(d => d.ma_tl_cha === selectedDocumentId);
        childDocs.forEach(child => results.push({ doc: child, relation: 'child' }));
        
        return results;
    }, [allData.documents, selectedDocumentId]);

    const expiringReportData = useMemo(() => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const thresholdDate = new Date(today);
        thresholdDate.setUTCDate(today.getUTCDate() + expiryDays);

        return allData.documents
            .map(doc => {
                if (!doc.ngay_het_hieu_luc) return null;

                const expiryDate = new Date(doc.ngay_het_hieu_luc);
                expiryDate.setUTCHours(0, 0, 0, 0);

                const diffTime = expiryDate.getTime() - today.getTime();
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const isExpired = expiryDate < today;
                const isExpiring = expiryDate >= today && expiryDate <= thresholdDate;

                if ((includeExpired && isExpired) || isExpiring) {
                    return { ...doc, daysRemaining };
                }
                
                return null;
            })
            .filter((doc): doc is DanhMucTaiLieu & { daysRemaining: number } => doc !== null)
            .sort((a, b) => a.daysRemaining - b.daysRemaining);
    }, [allData.documents, expiryDays, includeExpired]);
    
    const auditReportData = useMemo(() => {
        if (!selectedAuditId) return { audit: null, documents: [] };
        
        const selectedAudit = allData.auditSchedules.find(a => a.id === selectedAuditId);
        if (!selectedAudit) return { audit: null, documents: [] };

        const auditStandardIds = new Set(selectedAudit.tieu_chuan_ids);
        const linkedDocIds = new Set(selectedAudit.tai_lieu_lien_quan_ids || []);

        const matchingDocsMap = new Map<string, { doc: DanhMucTaiLieu; reason: Set<'standard' | 'linked'> }>();

        allData.documents.forEach(doc => {
            const isStandardMatch = doc.tieu_chuan_ids.some(docStdId => auditStandardIds.has(docStdId));
            const isLinked = linkedDocIds.has(doc.ma_tl);

            if (isStandardMatch || isLinked) {
                if (!matchingDocsMap.has(doc.ma_tl)) {
                    matchingDocsMap.set(doc.ma_tl, { doc, reason: new Set() });
                }
                const entry = matchingDocsMap.get(doc.ma_tl)!;
                if (isStandardMatch) entry.reason.add('standard');
                if (isLinked) entry.reason.add('linked');
            }
        });
        
        const documents = Array.from(matchingDocsMap.values()).sort((a,b) => a.doc.ma_tl.localeCompare(b.doc.ma_tl));

        return { audit: selectedAudit, documents };
    }, [allData.documents, allData.auditSchedules, selectedAuditId]);

    const printLayoutProps = useMemo(() => {
        let dataForPrint: any[] = [];
        switch (activeReport) {
            case 'by-department': dataForPrint = departmentReportData; break;
            case 'by-standard': dataForPrint = standardReportData; break;
            case 'relationships': dataForPrint = relationshipReportData; break;
            case 'expiring': dataForPrint = expiringReportData; break;
            case 'by-audit': dataForPrint = auditReportData.documents; break;
        }

        switch (activeReport) {
            case 'by-department': {
                if (!selectedDepartment) return null;
                return {
                    title: 'Báo cáo danh sách tài liệu',
                    filters: { 'Phòng ban': phongBanMap.get(selectedDepartment) || 'N/A' },
                    columns: [
                        { header: 'Tên tài liệu', accessor: (item: DanhMucTaiLieu) => item.ten_tai_lieu },
                        { header: 'Số hiệu', accessor: (item: DanhMucTaiLieu) => item.so_hieu },
                        { header: 'Phiên bản', accessor: (item: DanhMucTaiLieu) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                        { header: 'Trạng thái', accessor: (item: DanhMucTaiLieu) => translate(item.trang_thai) },
                        { header: 'Ngày hiệu lực', accessor: (item: DanhMucTaiLieu) => formatDateForDisplay(item.ngay_hieu_luc) },
                    ],
                    data: dataForPrint,
                };
            }
            case 'by-standard': {
                if (!selectedStandard) return null;
                return {
                    title: 'Báo cáo danh sách tài liệu',
                    filters: { 'Tiêu chuẩn': tieuChuanMap.get(selectedStandard) || 'N/A' },
                    columns: [
                        { header: 'Tên tài liệu', accessor: (item: DanhMucTaiLieu) => item.ten_tai_lieu },
                        { header: 'Số hiệu', accessor: (item: DanhMucTaiLieu) => item.so_hieu },
                        { header: 'Phiên bản', accessor: (item: DanhMucTaiLieu) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                         { header: 'Phòng ban', accessor: (item: DanhMucTaiLieu) => phongBanMap.get(item.phong_ban_quan_ly) },
                        { header: 'Trạng thái', accessor: (item: DanhMucTaiLieu) => translate(item.trang_thai) },
                    ],
                    data: dataForPrint,
                };
            }
            case 'relationships': {
                if (!selectedDocumentId) return null;
                const selectedDoc = allData.documents.find(d => d.ma_tl === selectedDocumentId);
                const docName = selectedDoc?.ten_tai_lieu || 'N/A';
                const docSoHieu = selectedDoc?.so_hieu || selectedDocumentId;
                return {
                    title: 'Báo cáo quan hệ tài liệu',
                    filters: { 'Tài liệu gốc': `${docName} (${docSoHieu})` },
                    columns: [
                        { header: 'Quan hệ', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => translate(item.relation) },
                        { header: 'Tên tài liệu', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => item.doc.ten_tai_lieu },
                        { header: 'Số hiệu', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => item.doc.so_hieu },
                        { header: 'Phiên bản', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                        { header: 'Trạng thái', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => translate(item.doc.trang_thai) },
                    ],
                    data: dataForPrint,
                };
            }
            case 'expiring': {
                return {
                    title: 'Báo cáo tài liệu hết và sắp hết hiệu lực',
                    filters: {
                        'Khung thời gian': `Trong vòng ${expiryDays} ngày tới`,
                        'Bao gồm đã hết hiệu lực': includeExpired ? 'Có' : 'Không',
                    },
                    columns: [
                        { header: 'Tên tài liệu', accessor: (item: any) => item.ten_tai_lieu },
                        { header: 'Ngày hết hiệu lực', accessor: (item: any) => formatDateForDisplay(item.ngay_het_hieu_luc) },
                        { header: 'Người rà soát', accessor: (item: any) => nhanSuMap.get(item.nguoi_ra_soat)?.ten || 'N/A' },
                        { header: 'Tình trạng', accessor: (item: any) => item.daysRemaining <= 0 ? `Đã hết hiệu lực` : `Còn ${item.daysRemaining} ngày` },
                    ],
                    data: dataForPrint,
                };
            }
            case 'by-audit': {
                if (!selectedAuditId) return null;
                const { audit } = auditReportData;
                return {
                    title: 'Báo cáo tài liệu theo lịch audit',
                    filters: { 'Cuộc Audit': audit?.ten_cuoc_audit || 'N/A' },
                    columns: [
                        { header: 'Tên tài liệu', accessor: (item: any) => item.doc.ten_tai_lieu },
                        { header: 'Số hiệu', accessor: (item: any) => item.doc.so_hieu },
                        { header: 'Phiên bản', accessor: (item: any) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                        { header: 'Lý do liên quan', accessor: (item: any) => Array.from(item.reason).map((r: any) => r === 'standard' ? 'Theo tiêu chuẩn' : 'Liên kết trực tiếp').join('; ') },
                        { header: 'Trạng thái', accessor: (item: any) => translate(item.doc.trang_thai) },
                    ],
                    data: dataForPrint,
                };
            }
            default: return null;
        }
    }, [
        activeReport, selectedDepartment, selectedStandard, selectedDocumentId, expiryDays, includeExpired, selectedAuditId, 
        departmentReportData, standardReportData, relationshipReportData, expiringReportData, auditReportData, 
        phongBanMap, tieuChuanMap, latestVersionMap, nhanSuMap, allData.documents
    ]);

    const handleExport = (reportType: ReportType) => {
        const commonHeaders = {
            so_hieu: 'Số hiệu',
            ten_tai_lieu: 'Tên tài liệu',
            phien_ban: 'Phiên bản',
            trang_thai: 'Trạng thái',
        };
        
        let options = {
            filename: 'bao_cao.csv',
            reportTitle: '',
            filtersApplied: [] as { label: string; value: string }[],
            detailData: [] as any[],
            detailHeaders: {},
        };

        switch(reportType) {
            case 'by-department':
                const deptName = phongBanMap.get(selectedDepartment) || 'N/A';
                options = {
                    ...options,
                    filename: `bao_cao_theo_phong_ban_${deptName}.csv`,
                    reportTitle: 'Báo cáo Tài liệu theo Phòng ban',
                    filtersApplied: [{ label: 'Phòng ban', value: deptName }],
                    detailData: departmentReportData.map(doc => ({
                        so_hieu: doc.so_hieu,
                        ten_tai_lieu: doc.ten_tai_lieu,
                        phien_ban: latestVersionMap.get(doc.ma_tl) || 'N/A',
                        trang_thai: translate(doc.trang_thai),
                        ngay_hieu_luc: formatDateForDisplay(doc.ngay_hieu_luc),
                    })),
                    detailHeaders: { ...commonHeaders, ngay_hieu_luc: 'Ngày hiệu lực' },
                };
                break;
            case 'by-standard':
                const stdName = tieuChuanMap.get(selectedStandard) || 'N/A';
                 options = {
                    ...options,
                    filename: `bao_cao_theo_tieu_chuan.csv`,
                    reportTitle: 'Báo cáo Tài liệu theo Tiêu chuẩn',
                    filtersApplied: [{ label: 'Tiêu chuẩn', value: stdName }],
                    detailData: standardReportData.map(doc => ({
                        so_hieu: doc.so_hieu,
                        ten_tai_lieu: doc.ten_tai_lieu,
                        phien_ban: latestVersionMap.get(doc.ma_tl) || 'N/A',
                        trang_thai: translate(doc.trang_thai),
                        ngay_hieu_luc: formatDateForDisplay(doc.ngay_hieu_luc),
                    })),
                    detailHeaders: { ...commonHeaders, ngay_hieu_luc: 'Ngày hiệu lực' },
                };
                break;
            case 'relationships':
                const docName = allData.documents.find(d => d.ma_tl === selectedDocumentId)?.ten_tai_lieu || 'N/A';
                options = {
                    ...options,
                    filename: `bao_cao_quan_he_tai_lieu.csv`,
                    reportTitle: 'Báo cáo Quan hệ Tài liệu',
                    filtersApplied: [{ label: 'Tài liệu gốc', value: `${docName} (${selectedDocumentId})` }],
                    detailData: relationshipReportData.map(item => ({
                        quan_he: translate(item.relation),
                        so_hieu: item.doc.so_hieu,
                        ten_tai_lieu: item.doc.ten_tai_lieu,
                        phien_ban: latestVersionMap.get(item.doc.ma_tl) || 'N/A',
                        trang_thai: translate(item.doc.trang_thai),
                    })),
                    detailHeaders: { 
                        quan_he: 'Quan hệ',
                        so_hieu: 'Số hiệu',
                        ten_tai_lieu: 'Tên tài liệu',
                        phien_ban: 'Phiên bản',
                        trang_thai: 'Trạng thái',
                    },
                };
                break;
            case 'expiring':
                options = {
                    ...options,
                    filename: `bao_cao_tai_lieu_sap_het_han.csv`,
                    reportTitle: 'Báo cáo Tài liệu Hết hiệu lực & Sắp hết hiệu lực',
                    filtersApplied: [
                        { label: 'Khung thời gian', value: `Trong vòng ${expiryDays} ngày tới` },
                        { label: 'Bao gồm đã hết hiệu lực', value: includeExpired ? 'Có' : 'Không' }
                    ],
                    detailData: expiringReportData.map(doc => ({
                        so_hieu: doc.so_hieu,
                        ten_tai_lieu: doc.ten_tai_lieu,
                        phien_ban: latestVersionMap.get(doc.ma_tl) || 'N/A',
                        ngay_het_hieu_luc: formatDateForDisplay(doc.ngay_het_hieu_luc),
                        nguoi_ra_soat: nhanSuMap.get(doc.nguoi_ra_soat)?.ten || 'N/A',
                        tinh_trang: doc.daysRemaining <= 0 ? 'Đã hết hiệu lực' : `Còn ${doc.daysRemaining} ngày`,
                    })),
                    detailHeaders: { 
                        so_hieu: 'Số hiệu',
                        ten_tai_lieu: 'Tên tài liệu',
                        phien_ban: 'Phiên bản',
                        ngay_het_hieu_luc: 'Ngày hết hiệu lực',
                        nguoi_ra_soat: 'Người rà soát',
                        tinh_trang: 'Tình trạng',
                    },
                };
                break;
            case 'by-audit':
                 const auditName = auditReportData.audit?.ten_cuoc_audit || 'N/A';
                 options = {
                    ...options,
                    filename: `bao_cao_audit_${auditName}.csv`,
                    reportTitle: 'Báo cáo Tài liệu theo Lịch Audit',
                    filtersApplied: [{ label: 'Cuộc Audit', value: auditName }],
                    detailData: auditReportData.documents.map(({ doc, reason }) => ({
                        so_hieu: doc.so_hieu,
                        ten_tai_lieu: doc.ten_tai_lieu,
                        phien_ban: latestVersionMap.get(doc.ma_tl) || 'N/A',
                        trang_thai: translate(doc.trang_thai),
                        ly_do_lien_quan: Array.from(reason).map((r: any) => r === 'standard' ? 'Theo tiêu chuẩn' : 'Liên kết trực tiếp').join('; '),
                    })),
                    detailHeaders: { ...commonHeaders, ly_do_lien_quan: 'Lý do liên quan' },
                };
                break;
        }

        exportReportToCsv(options as any);
    }
    
    const handleExportWord = (reportType: ReportType) => {
        let filename = 'bao_cao';
        switch(reportType) {
            case 'by-department':
                filename = `bao_cao_theo_phong_ban_${(phongBanMap.get(selectedDepartment) || 'chon_phong_ban')}`;
                break;
            case 'by-standard':
                filename = `bao_cao_theo_tieu_chuan_${(tieuChuanMap.get(selectedStandard) || 'chon_tieu_chuan')}`;
                break;
            case 'relationships':
                filename = `bao_cao_quan_he_tai_lieu_${selectedDocumentId}`;
                break;
            case 'expiring':
                filename = `bao_cao_tai_lieu_sap_het_han`;
                break;
            case 'by-audit':
                const auditName = auditReportData.audit?.ten_cuoc_audit || 'chon_audit';
                filename = `bao_cao_audit_${auditName}`;
                break;
        }
        exportVisibleReportToWord(filename.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    };

    const tabs = reportNavItems.map(({ key, title }) => ({ key, title }));

    const renderPagination = (totalPages: number, totalItems: number) => {
        if (totalItems === 0 || totalPages <= 1) return null;
        return (
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            >
                <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    - <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
                    {' '}trên <span className="font-medium">{totalItems}</span> mục
                </p>
            </Pagination>
        );
    };

    const ItemsPerPageSelector = () => (
        <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="form-label !mb-0">Dòng/trang:</label>
            <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="form-select !py-2 w-auto"
            >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
            </select>
        </div>
    );

    const renderReportContent = () => {
        const getPaginatedResult = (data: any[]) => {
            const totalItems = data.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            return { paginatedData, totalPages, totalItems };
        };

        switch (activeReport) {
            case 'by-department': {
                const { paginatedData, totalPages, totalItems } = getPaginatedResult(departmentReportData);
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end no-print">
                            <div>
                                <label htmlFor="department-select" className="form-label">Chọn phòng ban:</label>
                                <select id="department-select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="form-select">
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.phongBan.map(pb => <option key={pb.id} value={pb.id}>{pb.ten}</option>)}
                                </select>
                            </div>
                            {selectedDepartment && <div className="flex items-center justify-end gap-4"><ItemsPerPageSelector /> <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('by-department')} onExportWord={() => handleExportWord('by-department')} /></div>}
                        </div>
                        {selectedDepartment ? 
                                departmentReportData.length > 0 ? (
                                <>
                                    <Table<DanhMucTaiLieu> data={paginatedData} onRowClick={onViewDetails} columns={[
                                        { header: 'Số hiệu', accessor: 'so_hieu' },
                                        { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                        { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                                        { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                                        { header: 'Ngày hiệu lực', accessor: (item) => formatDateForDisplay(item.ngay_hieu_luc) },
                                        { header: 'In', accessor: (item: DanhMucTaiLieu) => item.file_pdf ? <a href={item.file_pdf} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center text-gray-500 hover:text-blue-700 w-full" title="Mở PDF để in"><Icon type="printer" className="h-5 w-5" /></a> : <span className="inline-flex items-center justify-center text-gray-300 w-full cursor-not-allowed" title="Không có file PDF"><Icon type="printer" className="h-5 w-5" /></span>, className: 'text-center' }
                                    ]} />
                                    {renderPagination(totalPages, totalItems)}
                                </>
                            ) : <NoData message="Không có tài liệu nào cho phòng ban này." />
                            : <NoData message="Vui lòng chọn một phòng ban để xem báo cáo." />
                        }
                    </ReportContentWrapper>
                );
            }
            case 'by-standard': {
                 const { paginatedData, totalPages, totalItems } = getPaginatedResult(standardReportData);
                 return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end no-print">
                            <div>
                                <label htmlFor="standard-select" className="form-label">Chọn tiêu chuẩn:</label>
                                <select id="standard-select" value={selectedStandard} onChange={e => setSelectedStandard(e.target.value)} className="form-select">
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.tieuChuan.filter(tc => tc.is_active).map(tc => {
                                        const versionPart = tc.phien_ban ? `v${tc.phien_ban}` : '';
                                        const detailsPart = [tc.ten_viet_tat, versionPart].filter(Boolean).join(' ');
                                        const displayText = detailsPart ? `${tc.ten} (${detailsPart})` : tc.ten;
                                        return <option key={tc.id} value={tc.id}>{displayText}</option>;
                                    })}
                                </select>
                            </div>
                            {selectedStandard && <div className="flex items-center justify-end gap-4"><ItemsPerPageSelector /> <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('by-standard')} onExportWord={() => handleExportWord('by-standard')} /></div>}
                        </div>
                        {selectedStandard ? 
                                standardReportData.length > 0 ? (
                                <>
                                    <Table<DanhMucTaiLieu> data={paginatedData} onRowClick={onViewDetails} columns={[
                                        { header: 'Số hiệu', accessor: 'so_hieu' },
                                        { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                        { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                                        { header: 'Phòng ban', accessor: (item) => phongBanMap.get(item.phong_ban_quan_ly) },
                                        { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                                        { header: 'In', accessor: (item: DanhMucTaiLieu) => item.file_pdf ? <a href={item.file_pdf} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center text-gray-500 hover:text-blue-700 w-full" title="Mở PDF để in"><Icon type="printer" className="h-5 w-5" /></a> : <span className="inline-flex items-center justify-center text-gray-300 w-full cursor-not-allowed" title="Không có file PDF"><Icon type="printer" className="h-5 w-5" /></span>, className: 'text-center' }
                                    ]} />
                                    {renderPagination(totalPages, totalItems)}
                                </>
                            ) : <NoData message="Không có tài liệu nào cho tiêu chuẩn này." />
                            : <NoData message="Vui lòng chọn một tiêu chuẩn để xem báo cáo." />
                        }
                    </ReportContentWrapper>
                );
            }
            case 'relationships': {
                const { paginatedData, totalPages, totalItems } = getPaginatedResult(relationshipReportData);
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end no-print">
                           <div>
                                <label htmlFor="document-select" className="form-label">Chọn tài liệu:</label>
                                <select id="document-select" value={selectedDocumentId} onChange={e => setSelectedDocumentId(e.target.value)} className="form-select">
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.documents.map(d => <option key={d.ma_tl} value={d.ma_tl}>{d.ten_tai_lieu} ({d.so_hieu})</option>)}
                                </select>
                            </div>
                            {selectedDocumentId && <div className="flex items-center justify-end gap-4"><ItemsPerPageSelector /> <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('relationships')} onExportWord={() => handleExportWord('relationships')} /></div>}
                        </div>
                            {selectedDocumentId ? 
                                relationshipReportData.length > 1 ? (
                                <>
                                    <Table data={paginatedData} onRowClick={item => onViewDetails(item.doc)} columns={[
                                        { header: 'Quan hệ', accessor: (item) => { const text = translate(item.relation); return item.relation === 'self' ? <strong className="text-blue-600">{text}</strong> : text; }},
                                        { header: 'Tên tài liệu', accessor: (item) => { if (item.relation === 'child') return <span className="pl-4">└─ {item.doc.ten_tai_lieu}</span>; return item.doc.ten_tai_lieu; }},
                                        { header: 'Số hiệu', accessor: (item) => item.doc.so_hieu },
                                        { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                                        { header: 'Trạng thái', accessor: (item) => <Badge status={item.doc.trang_thai} /> },
                                        { header: 'In', accessor: (item) => item.doc.file_pdf ? <a href={item.doc.file_pdf} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center text-gray-500 hover:text-blue-700 w-full" title="Mở PDF để in"><Icon type="printer" className="h-5 w-5" /></a> : <span className="inline-flex items-center justify-center text-gray-300 w-full cursor-not-allowed" title="Không có file PDF"><Icon type="printer" className="h-5 w-5" /></span>, className: 'text-center' }
                                    ]} />
                                    {renderPagination(totalPages, totalItems)}
                                </>
                            ) : <NoData message="Tài liệu này không có quan hệ cha-con nào." />
                            : <NoData message="Vui lòng chọn một tài liệu để xem quan hệ." />
                        }
                    </ReportContentWrapper>
                );
            }
            case 'expiring': {
                const { paginatedData, totalPages, totalItems } = getPaginatedResult(expiringReportData);
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end no-print">
                            <div>
                                <label htmlFor="expiry-days" className="form-label">Khung thời gian:</label>
                                <select id="expiry-days" value={expiryDays} onChange={e => setExpiryDays(Number(e.target.value))} className="form-select">
                                    <option value={30}>30 ngày tới</option>
                                    <option value={60}>60 ngày tới</option>
                                    <option value={90}>90 ngày tới</option>
                                </select>
                            </div>
                            <div className="flex items-center self-end pb-2">
                                <input id="include-expired" name="include-expired" type="checkbox" checked={includeExpired} onChange={(e) => setIncludeExpired(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"/>
                                <label htmlFor="include-expired" className="ml-2 text-sm font-medium text-gray-900">Bao gồm đã hết hiệu lực</label>
                            </div>
                            <div className="flex items-center justify-end gap-4"><ItemsPerPageSelector /> <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('expiring')} onExportWord={() => handleExportWord('expiring')} /></div>
                        </div>
                        {expiringReportData.length > 0 ? (
                             <>
                                <Table<DanhMucTaiLieu & { daysRemaining: number }> data={paginatedData} onRowClick={onViewDetails} columns={[
                                    { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                    { header: 'Số hiệu', accessor: 'so_hieu' },
                                    { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                                    { header: 'Phòng ban', accessor: (item) => phongBanMap.get(item.phong_ban_quan_ly) },
                                    { header: 'Ngày hết hiệu lực', accessor: (item) => formatDateForDisplay(item.ngay_het_hieu_luc) },
                                    { header: 'Người rà soát', accessor: (item) => nhanSuMap.get(item.nguoi_ra_soat)?.ten || 'N/A' },
                                    { header: 'Tình trạng', accessor: (item) => { if (item.daysRemaining <= 0) return <span className="inline-flex items-center font-medium rounded-full text-xs px-2 py-0.5 bg-red-100 text-red-800">Đã hết hiệu lực</span>; return <span className="inline-flex items-center font-medium rounded-full text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800">{`Còn ${item.daysRemaining} ngày`}</span>; }},
                                ]} />
                                {renderPagination(totalPages, totalItems)}
                            </>
                        ) : <NoData message={`Không có tài liệu nào khớp với điều kiện.`} />}
                    </ReportContentWrapper>
                );
            }
            case 'by-audit': {
                const { audit, documents: auditDocuments } = auditReportData;
                const { paginatedData, totalPages, totalItems } = getPaginatedResult(auditDocuments);
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end no-print">
                            <div>
                                <label htmlFor="audit-select" className="form-label">Chọn cuộc audit:</label>
                                <select id="audit-select" value={selectedAuditId} onChange={e => setSelectedAuditId(e.target.value)} className="form-select">
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.auditSchedules.map(a => <option key={a.id} value={a.id}>{`${a.ten_cuoc_audit} (${formatDateForDisplay(a.ngay_bat_dau)})`}</option>)}
                                </select>
                            </div>
                            {selectedAuditId && <div className="flex items-center justify-end gap-4"><ItemsPerPageSelector /> <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('by-audit')} onExportWord={() => handleExportWord('by-audit')} /></div>}
                        </div>
                        {!selectedAuditId ? (
                            <NoData message="Vui lòng chọn một cuộc audit để xem báo cáo." />
                        ) : (
                            <div>
                                {audit && (
                                    <div className="border-b border-gray-200">
                                        <div className="px-4 py-3 sm:px-6 bg-slate-50">
                                            <h3 className="text-base font-semibold text-gray-800">Thông tin cuộc Audit</h3>
                                        </div>
                                        <dl className="p-4 sm:p-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-4">
                                            <DetailItem className="sm:col-span-4" label="Tên" value={audit.ten_cuoc_audit} />
                                            <DetailItem className="sm:col-span-2" label="Thời gian" value={`${formatDateForDisplay(audit.ngay_bat_dau)} - ${formatDateForDisplay(audit.ngay_ket_thuc)}`} />
                                            <DetailItem className="sm:col-span-2" label="Trạng thái" value={<Badge status={audit.trang_thai}/>} />
                                            <DetailItem className="sm:col-span-4" label="Tiêu chuẩn" value={(audit.tieu_chuan_ids || []).map(id => (<span key={id} className="mr-2 mb-2 inline-block"><Badge status={tieuChuanMap.get(id) || id} size="sm" /></span>))}/>
                                            <DetailItem className="sm:col-span-2" label="Trưởng đoàn" value={danhGiaVienMap.get(audit.chuyen_gia_danh_gia_truong_id)} />
                                            <DetailItem className="sm:col-span-2" label="Thành viên" value={audit.doan_danh_gia_ids.map(id => danhGiaVienMap.get(id)).join(', ')} />
                                            {audit.loai_audit === 'external' && (
                                                <DetailItem className="sm:col-span-2" label="Tổ chức đánh giá" value={toChucDanhGiaMap.get(audit.to_chuc_danh_gia_id || '')} />
                                            )}
                                        </dl>
                                    </div>
                                )}
                                {auditDocuments.length > 0 ? (
                                    <>
                                        <Table<{ doc: DanhMucTaiLieu; reason: Set<'standard' | 'linked'> }> 
                                            data={paginatedData} 
                                            onRowClick={item => onViewDetails(item.doc)} 
                                            columns={[
                                            { header: 'Số hiệu', accessor: (item) => item.doc.so_hieu },
                                            { header: 'Tên tài liệu', accessor: (item) => item.doc.ten_tai_lieu },
                                            { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                                            { header: 'Lý do liên quan', accessor: (item) => <div className="flex flex-col items-start gap-1">{Array.from(item.reason).map(r => <span key={r} className={`text-xs px-1.5 py-0.5 rounded-full ${r === 'standard' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{r === 'standard' ? 'Theo tiêu chuẩn' : 'Liên kết trực tiếp'}</span>)}</div>},
                                            { header: 'Trạng thái', accessor: (item) => <Badge status={item.doc.trang_thai} /> },
                                            { header: 'In', accessor: (item) => item.doc.file_pdf ? <a href={item.doc.file_pdf} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center text-gray-500 hover:text-blue-700 w-full" title="Mở PDF để in"><Icon type="printer" className="h-5 w-5" /></a> : <span className="inline-flex items-center justify-center text-gray-300 w-full cursor-not-allowed" title="Không có file PDF"><Icon type="printer" className="h-5 w-5" /></span>, className: 'text-center' }
                                        ]} />
                                        {renderPagination(totalPages, totalItems)}
                                    </>
                                ) : <NoData message="Không có tài liệu nào thuộc phạm vi của cuộc audit này." />}
                            </div>
                        )}
                    </ReportContentWrapper>
                );
            }
            default:
                return null;
        }
    };
    

    return (
        <>
            {printLayoutProps && <PrintReportLayout {...printLayoutProps} currentUser={currentUser} />}
            <div className="no-print space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Báo cáo & thống kê</h1>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveReport(tab.key as ReportType)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeReport === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div>
                    {renderReportContent()}
                </div>
            </div>
        </>
    );
};

export default ReportsPage;