import React, { useState, useMemo, useEffect } from 'react';
import type { DanhMucTaiLieu, PhienBanTaiLieu, PhongBan, TieuChuan, ReportType, LichAudit, DanhGiaVien, ToChucDanhGia, NhanSu } from '../types';
import { reportNavItems, DocumentStatus } from '../constants';
import { formatDateForDisplay } from '../utils/dateUtils';
import { translate } from '../utils/translations';
import { exportReportToCsv, exportVisibleReportToWord } from '../utils/exportUtils';

import Card from './ui/Card';
import Table from './ui/Table';
import Badge from './ui/Badge';
import { Icon } from './ui/Icon';
import ExportDropdown from './ui/ExportDropdown';
import PrintReportLayout from './PrintReportLayout';

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
    <div className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm shadow-md border border-stone-200/50 dark:border-stone-700/50 rounded-xl mt-4">{children}</div>
);

const NoData: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-6 text-center text-stone-500">
        <p>{message}</p>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth = false }) => {
    if (!value && typeof value !== 'string' && typeof value !== 'number') return null;
    return (
        <div className={fullWidth ? 'sm:col-span-2' : ''}>
            <dt className="text-sm font-medium text-stone-500">{label}</dt>
            <dd className="mt-1 text-sm text-stone-900">{value}</dd>
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

    useEffect(() => {
        if (initialReportType) {
            setActiveReport(initialReportType);
        }
    }, [initialReportType]);

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
        switch (activeReport) {
            case 'by-department': {
                if (!selectedDepartment) return null;
                return {
                    title: 'BÁO CÁO DANH SÁCH TÀI LIỆU',
                    filters: { 'Phòng ban': phongBanMap.get(selectedDepartment) || 'N/A' },
                    columns: [
                        { header: 'Mã TL', accessor: (item: DanhMucTaiLieu) => item.ma_tl },
                        { header: 'Tên tài liệu', accessor: (item: DanhMucTaiLieu) => item.ten_tai_lieu },
                        { header: 'Phiên bản', accessor: (item: DanhMucTaiLieu) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                        { header: 'Trạng thái', accessor: (item: DanhMucTaiLieu) => translate(item.trang_thai) },
                        { header: 'Ngày hiệu lực', accessor: (item: DanhMucTaiLieu) => formatDateForDisplay(item.ngay_hieu_luc) },
                    ],
                    data: departmentReportData,
                };
            }
            case 'by-standard': {
                if (!selectedStandard) return null;
                return {
                    title: 'BÁO CÁO DANH SÁCH TÀI LIỆU',
                    filters: { 'Tiêu chuẩn': tieuChuanMap.get(selectedStandard) || 'N/A' },
                    columns: [
                        { header: 'Mã TL', accessor: (item: DanhMucTaiLieu) => item.ma_tl },
                        { header: 'Tên tài liệu', accessor: (item: DanhMucTaiLieu) => item.ten_tai_lieu },
                        { header: 'Phiên bản', accessor: (item: DanhMucTaiLieu) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                         { header: 'Phòng ban', accessor: (item: DanhMucTaiLieu) => phongBanMap.get(item.phong_ban_quan_ly) },
                        { header: 'Trạng thái', accessor: (item: DanhMucTaiLieu) => translate(item.trang_thai) },
                    ],
                    data: standardReportData,
                };
            }
            case 'relationships': {
                if (!selectedDocumentId) return null;
                const docName = allData.documents.find(d => d.ma_tl === selectedDocumentId)?.ten_tai_lieu || 'N/A';
                return {
                    title: 'BÁO CÁO QUAN HỆ TÀI LIỆU',
                    filters: { 'Tài liệu gốc': `${docName} (${selectedDocumentId})` },
                    columns: [
                        { header: 'Quan hệ', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => translate(item.relation) },
                        { header: 'Tên tài liệu', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => item.doc.ten_tai_lieu },
                        { header: 'Mã TL', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => item.doc.ma_tl },
                        { header: 'Phiên bản', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                        { header: 'Trạng thái', accessor: (item: { doc: DanhMucTaiLieu, relation: string }) => translate(item.doc.trang_thai) },
                    ],
                    data: relationshipReportData,
                };
            }
            case 'expiring': {
                return {
                    title: 'BÁO CÁO TÀI LIỆU HẾT VÀ SẮP HẾT HIỆU LỰC',
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
                    data: expiringReportData,
                };
            }
            case 'by-audit': {
                if (!selectedAuditId) return null;
                const { audit } = auditReportData;
                return {
                    title: 'BÁO CÁO TÀI LIỆU THEO LỊCH AUDIT',
                    filters: { 'Cuộc Audit': audit?.ten_cuoc_audit || 'N/A' },
                    columns: [
                        { header: 'Mã TL', accessor: (item: any) => item.doc.ma_tl },
                        { header: 'Tên tài liệu', accessor: (item: any) => item.doc.ten_tai_lieu },
                        { header: 'Phiên bản', accessor: (item: any) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                        { header: 'Lý do liên quan', accessor: (item: any) => Array.from(item.reason).map((r: any) => r === 'standard' ? 'Theo tiêu chuẩn' : 'Liên kết trực tiếp').join('; ') },
                        { header: 'Trạng thái', accessor: (item: any) => translate(item.doc.trang_thai) },
                    ],
                    data: auditReportData.documents,
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
            ma_tl: 'Mã TL',
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
                        ma_tl: doc.ma_tl,
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
                        ma_tl: doc.ma_tl,
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
                        ma_tl: item.doc.ma_tl,
                        so_hieu: item.doc.so_hieu,
                        ten_tai_lieu: item.doc.ten_tai_lieu,
                        phien_ban: latestVersionMap.get(item.doc.ma_tl) || 'N/A',
                        trang_thai: translate(item.doc.trang_thai),
                    })),
                    detailHeaders: { quan_he: 'Quan hệ', ...commonHeaders },
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
                        ma_tl: doc.ma_tl,
                        so_hieu: doc.so_hieu,
                        ten_tai_lieu: doc.ten_tai_lieu,
                        phien_ban: latestVersionMap.get(doc.ma_tl) || 'N/A',
                        ngay_het_hieu_luc: formatDateForDisplay(doc.ngay_het_hieu_luc),
                        nguoi_ra_soat: nhanSuMap.get(doc.nguoi_ra_soat)?.ten || 'N/A',
                        tinh_trang: doc.daysRemaining <= 0 ? 'Đã hết hiệu lực' : `Còn ${doc.daysRemaining} ngày`,
                    })),
                    detailHeaders: { 
                        ma_tl: 'Mã TL', 
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
                        ma_tl: doc.ma_tl,
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
    const selectStyles = "rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-200 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm";

    const renderReportContent = () => {
        switch (activeReport) {
            case 'by-department': {
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between flex-wrap gap-4 no-print">
                            <div className="flex items-center gap-2">
                                <label htmlFor="department-select" className="text-sm font-medium text-stone-900 dark:text-stone-200">Chọn phòng ban:</label>
                                <select id="department-select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className={selectStyles}>
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.phongBan.map(pb => <option key={pb.id} value={pb.id}>{pb.ten}</option>)}
                                </select>
                            </div>
                            {selectedDepartment && <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('by-department')} onExportWord={() => handleExportWord('by-department')} />}
                        </div>
                        {selectedDepartment ? 
                                departmentReportData.length > 0 ? (
                                <Table<DanhMucTaiLieu> data={departmentReportData} onRowClick={onViewDetails} columns={[
                                    { header: 'Mã TL', accessor: 'ma_tl' },
                                    { header: 'Số hiệu', accessor: 'so_hieu' },
                                    { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                    { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                                    { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                                    { header: 'Ngày hiệu lực', accessor: (item) => formatDateForDisplay(item.ngay_hieu_luc) },
                                    {
                                        header: 'In',
                                        accessor: (item: DanhMucTaiLieu) => {
                                            if (item.file_pdf) {
                                                return (
                                                    <a href={item.file_pdf} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center text-stone-500 hover:text-rose-700 w-full" title="Mở PDF để in">
                                                        <Icon type="printer" className="h-5 w-5" />
                                                    </a>
                                                )
                                            }
                                            return (
                                                <span className="inline-flex items-center justify-center text-stone-300 w-full cursor-not-allowed" title="Không có file PDF">
                                                    <Icon type="printer" className="h-5 w-5" />
                                                </span>
                                            );
                                        },
                                        className: 'text-center'
                                    }
                                ]} />
                            ) : <NoData message="Không có tài liệu nào cho phòng ban này." />
                            : <NoData message="Vui lòng chọn một phòng ban để xem báo cáo." />
                        }
                    </ReportContentWrapper>
                );
            }
            case 'by-standard': {
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between flex-wrap gap-4 no-print">
                            <div className="flex items-center gap-2">
                                <label htmlFor="standard-select" className="text-sm font-medium text-stone-900 dark:text-stone-200">Chọn tiêu chuẩn:</label>
                                <select id="standard-select" value={selectedStandard} onChange={e => setSelectedStandard(e.target.value)} className={selectStyles}>
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.tieuChuan.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.ten_viet_tat ? `${s.ten_viet_tat} - ${s.ten}` : s.ten}</option>)}
                                </select>
                            </div>
                            {selectedStandard && <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('by-standard')} onExportWord={() => handleExportWord('by-standard')} />}
                        </div>
                        {selectedStandard ? 
                            standardReportData.length > 0 ? (
                            <Table<DanhMucTaiLieu> data={standardReportData} onRowClick={onViewDetails} columns={[
                                { header: 'Mã TL', accessor: 'ma_tl' },
                                { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.ma_tl) || 'N/A' },
                                { header: 'Phòng ban', accessor: (item) => phongBanMap.get(item.phong_ban_quan_ly) },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.trang_thai} /> },
                            ]} />
                        ) : <NoData message="Không có tài liệu nào cho tiêu chuẩn này." />
                        : <NoData message="Vui lòng chọn một tiêu chuẩn để xem báo cáo." />
                        }
                    </ReportContentWrapper>
                );
            }
            case 'relationships': {
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between flex-wrap gap-4 no-print">
                            <div className="flex items-center gap-2">
                                <label htmlFor="document-select" className="text-sm font-medium text-stone-900 dark:text-stone-200">Chọn tài liệu gốc:</label>
                                <select id="document-select" value={selectedDocumentId} onChange={e => setSelectedDocumentId(e.target.value)} className={selectStyles}>
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.documents.map(d => <option key={d.ma_tl} value={d.ma_tl}>{d.ten_tai_lieu} ({d.ma_tl})</option>)}
                                </select>
                            </div>
                            {selectedDocumentId && <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('relationships')} onExportWord={() => handleExportWord('relationships')} />}
                        </div>
                        {selectedDocumentId ? 
                            relationshipReportData.length > 0 ? (
                            <Table<{ doc: DanhMucTaiLieu, relation: string }> data={relationshipReportData} onRowClick={(item) => onViewDetails(item.doc)} columns={[
                                { header: 'Quan hệ', accessor: (item) => translate(item.relation), className: 'font-bold' },
                                { header: 'Tên tài liệu', accessor: (item) => item.doc.ten_tai_lieu },
                                { header: 'Mã TL', accessor: (item) => item.doc.ma_tl },
                                { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.doc.trang_thai} /> },
                            ]} rowClassName={(item) => item.relation === 'self' ? 'bg-rose-50 dark:bg-rose-900/20' : ''} />
                        ) : <NoData message="Không có dữ liệu quan hệ cho tài liệu này." />
                        : <NoData message="Vui lòng chọn một tài liệu để xem quan hệ." />
                        }
                    </ReportContentWrapper>
                );
            }
            case 'expiring': {
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between flex-wrap gap-4 no-print">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="expiry-days" className="text-sm font-medium text-stone-900 dark:text-stone-200">Hết hạn trong:</label>
                                    <input id="expiry-days" type="number" value={expiryDays} onChange={e => setExpiryDays(Number(e.target.value))} className={`${selectStyles} w-24`} />
                                    <span className="text-sm text-stone-900 dark:text-stone-200">ngày</span>
                                </div>
                                <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="include-expired" name="include-expired" type="checkbox" checked={includeExpired} onChange={e => setIncludeExpired(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-600" />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="include-expired" className="font-medium text-stone-900 dark:text-stone-200">Bao gồm tài liệu đã hết hiệu lực</label>
                                    </div>
                                </div>
                            </div>
                            <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('expiring')} onExportWord={() => handleExportWord('expiring')} />
                        </div>
                        {expiringReportData.length > 0 ? (
                            <Table<DanhMucTaiLieu & { daysRemaining: number }> data={expiringReportData} onRowClick={onViewDetails} columns={[
                                { header: 'Tên tài liệu', accessor: 'ten_tai_lieu' },
                                { header: 'Số hiệu', accessor: 'so_hieu' },
                                { header: 'Ngày hết hiệu lực', accessor: (item) => formatDateForDisplay(item.ngay_het_hieu_luc) },
                                { header: 'Người rà soát', accessor: (item) => allData.nhanSu.find(ns => ns.id === item.nguoi_ra_soat)?.ten || 'N/A' },
                                { header: 'Tình trạng', accessor: (item) => item.daysRemaining <= 0 ? <Badge status={DocumentStatus.HET_HIEU_LUC} title={`Quá hạn ${-item.daysRemaining} ngày`} /> : <span className="text-sm text-amber-700 dark:text-amber-400">{`Còn ${item.daysRemaining} ngày`}</span> },
                            ]} />
                        ) : <NoData message="Không có tài liệu nào sắp hết hiệu lực trong khoảng thời gian đã chọn." />
                        }
                    </ReportContentWrapper>
                );
            }
            case 'by-audit': {
                const { audit, documents: auditDocs } = auditReportData;
                return (
                    <ReportContentWrapper>
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between flex-wrap gap-4 no-print">
                            <div className="flex items-center gap-2">
                                <label htmlFor="audit-select" className="text-sm font-medium text-stone-900 dark:text-stone-200">Chọn cuộc audit:</label>
                                <select id="audit-select" value={selectedAuditId} onChange={e => setSelectedAuditId(e.target.value)} className={selectStyles}>
                                    <option value="">-- Vui lòng chọn --</option>
                                    {allData.auditSchedules.map(a => <option key={a.id} value={a.id}>{a.ten_cuoc_audit}</option>)}
                                </select>
                            </div>
                            {selectedAuditId && <ExportDropdown onPrint={window.print} onExportCsv={() => handleExport('by-audit')} onExportWord={() => handleExportWord('by-audit')} />}
                        </div>
                        {selectedAuditId ? 
                            audit ? (
                                <div>
                                    <div className="p-4 space-y-4">
                                        <h4 className="font-semibold text-stone-900 dark:text-stone-200">Thông tin chi tiết Audit</h4>
                                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                            <DetailItem label="Loại Audit" value={audit.loai_audit === 'internal' ? 'Nội bộ' : `Bên ngoài (${toChucDanhGiaMap.get(audit.to_chuc_danh_gia_id || '') || 'N/A'})`} />
                                            <DetailItem label="Trạng thái" value={<Badge status={audit.trang_thai} />} />
                                            <DetailItem label="Thời gian" value={`${formatDateForDisplay(audit.ngay_bat_dau)} - ${formatDateForDisplay(audit.ngay_ket_thuc)}`} />
                                            <DetailItem label="Trưởng đoàn" value={danhGiaVienMap.get(audit.chuyen_gia_danh_gia_truong_id) || 'N/A'} />
                                            <DetailItem label="Phạm vi" value={audit.pham_vi} fullWidth />
                                            <DetailItem label="Tiêu chuẩn áp dụng" value={audit.tieu_chuan_ids.map(id => tieuChuanMap.get(id)).join(', ')} fullWidth />
                                        </dl>
                                    </div>
                                    <h4 className="px-4 mt-2 font-semibold text-stone-900 dark:text-stone-200">Tài liệu liên quan</h4>
                                    {auditDocs.length > 0 ? (
                                        <Table<{ doc: DanhMucTaiLieu; reason: Set<'standard' | 'linked'> }> 
                                            data={auditDocs} 
                                            onRowClick={(item) => onViewDetails(item.doc)} 
                                            columns={[
                                                { header: 'Mã TL', accessor: (item) => item.doc.ma_tl },
                                                { header: 'Tên tài liệu', accessor: (item) => item.doc.ten_tai_lieu },
                                                { header: 'Phiên bản', accessor: (item) => latestVersionMap.get(item.doc.ma_tl) || 'N/A' },
                                                { header: 'Lý do liên quan', accessor: (item) => Array.from(item.reason).map(r => r === 'standard' ? 'Theo tiêu chuẩn' : 'Liên kết trực tiếp').join('; ') },
                                                { header: 'Trạng thái', accessor: (item) => <Badge status={item.doc.trang_thai} /> },
                                            ]} 
                                        />
                                    ) : <NoData message="Không có tài liệu nào liên quan đến cuộc audit này." />}
                                </div>
                            ) : <NoData message="Không tìm thấy thông tin audit." />
                            : <NoData message="Vui lòng chọn một cuộc audit để xem báo cáo." />
                        }
                    </ReportContentWrapper>
                );
            }
        }
    };
    

    return (
        <>
            {printLayoutProps && <PrintReportLayout {...printLayoutProps} currentUser={currentUser} />}
            <div className="no-print space-y-6">
                <h1 className="text-3xl font-bold text-stone-900">Báo cáo & Thống kê</h1>

                <div className="border-b border-stone-200 dark:border-stone-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveReport(tab.key as ReportType)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeReport === tab.key
                                        ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                                        : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
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