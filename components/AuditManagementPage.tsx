import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { LichAudit, NhanSu, TieuChuan, DanhMucTaiLieu, DanhGiaVien, ToChucDanhGia } from '../types';
import Card from './ui/Card';
import Table from './ui/Table';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';
import ConfirmationDialog from './ui/ConfirmationDialog';
import AuditScheduleForm from './forms/AuditScheduleForm';
import Badge from './ui/Badge';
import { formatDateForDisplay } from '../utils/dateUtils';
import { translate } from '../utils/translations';
import DatePicker from './ui/DatePicker';
import ExportDropdown from './ui/ExportDropdown';
import { exportToCsv, exportVisibleReportToWord } from '../utils/exportUtils';
import PrintReportLayout from './PrintReportLayout';
import Pagination from './ui/Pagination';
import CalendarView from './ui/CalendarView';

type AllData = {
    auditSchedules: LichAudit[];
    nhanSu: NhanSu[];
    tieuChuan: TieuChuan[];
    documents: DanhMucTaiLieu[];
    danhGiaVien: DanhGiaVien[];
    toChucDanhGia: ToChucDanhGia[];
};

interface AuditManagementPageProps {
    allData: AllData;
    onUpdateData: React.Dispatch<React.SetStateAction<any>>;
    currentUser: NhanSu;
}

type SortConfig = {
    key: keyof LichAudit;
    direction: 'ascending' | 'descending';
} | null;

const AuditManagementPage: React.FC<AuditManagementPageProps> = ({ allData, onUpdateData, currentUser }) => {
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAudit, setEditingAudit] = useState<LichAudit | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ngay_bat_dau', direction: 'descending' });
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    
    useEffect(() => {
        // Default to list view on smaller screens
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            setViewMode('list');
        }
        
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setViewMode('list');
            }
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, sortConfig, dateFilter]);

    const { danhGiaVienMap, toChucDanhGiaMap } = useMemo(() => ({
        danhGiaVienMap: new Map(allData.danhGiaVien.filter(Boolean).map(dgv => [dgv.id, dgv.ten])),
        toChucDanhGiaMap: new Map(allData.toChucDanhGia.filter(Boolean).map(org => [org.id, org.ten])),
    }), [allData.danhGiaVien, allData.toChucDanhGia]);

    const filteredAudits = useMemo(() => {
        let items = [...allData.auditSchedules];
        if (dateFilter.start || dateFilter.end) {
            const filterStartDate = dateFilter.start ? new Date(dateFilter.start) : null;
            const filterEndDate = dateFilter.end ? new Date(dateFilter.end) : null;

            if(filterStartDate) filterStartDate.setUTCHours(0,0,0,0);
            if(filterEndDate) filterEndDate.setUTCHours(23,59,59,999);

            items = items.filter(audit => {
                const auditStartDate = new Date(audit.ngay_bat_dau);
                const auditEndDate = new Date(audit.ngay_ket_thuc);
                
                const startsAfterFilterEnd = filterEndDate && auditStartDate > filterEndDate;
                const endsBeforeFilterStart = filterStartDate && auditEndDate < filterStartDate;

                return !(startsAfterFilterEnd || endsBeforeFilterStart);
            });
        }
        return items;
    }, [allData.auditSchedules, dateFilter]);
    
    const calendarEvents = useMemo(() => {
        return filteredAudits.map(audit => ({
            id: audit.id,
            title: audit.ten_cuoc_audit,
            startDate: new Date(audit.ngay_bat_dau),
            endDate: new Date(audit.ngay_ket_thuc),
            data: audit,
        }));
    }, [filteredAudits]);

    const sortedAudits = useMemo(() => {
        let sortableItems = [...filteredAudits];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue == null) return 1;
                if (bValue == null) return -1;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredAudits, sortConfig]);
    
    const paginatedAudits = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAudits.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAudits, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedAudits.length / itemsPerPage);

    const printLayoutProps = useMemo(() => {
        const activeFilters: Record<string, string> = {};
        if (dateFilter.start) activeFilters['Từ ngày'] = formatDateForDisplay(dateFilter.start);
        if (dateFilter.end) activeFilters['Đến ngày'] = formatDateForDisplay(dateFilter.end);
        
        return {
            title: 'Danh sách lịch Audit',
            filters: activeFilters,
            columns: [
                { header: 'Tên cuộc audit', accessor: (item: LichAudit) => item.ten_cuoc_audit, width: '30%' },
                { header: 'Loại', accessor: (item: LichAudit) => item.loai_audit === 'internal' ? 'Nội bộ' : 'Bên ngoài', width: '10%' },
                { header: 'Ngày bắt đầu', accessor: (item: LichAudit) => formatDateForDisplay(item.ngay_bat_dau), width: '15%' },
                { header: 'Ngày kết thúc', accessor: (item: LichAudit) => formatDateForDisplay(item.ngay_ket_thuc), width: '15%' },
                { header: 'Trưởng đoàn', accessor: (item: LichAudit) => danhGiaVienMap.get(item.chuyen_gia_danh_gia_truong_id) || 'N/A', width: '15%' },
                { header: 'Trạng thái', accessor: (item: LichAudit) => translate(item.trang_thai), width: '10%' },
            ],
            data: sortedAudits,
        };
    }, [sortedAudits, dateFilter, danhGiaVienMap]);

    const requestSort = (key: keyof LichAudit) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortableHeader = (label: string, key: keyof LichAudit) => {
        const isSorting = sortConfig?.key === key;
        const sortIcon = isSorting ? (sortConfig.direction === 'ascending' ? 'chevron-up' : 'chevron-down') : 'chevron-down';
        return (
            <button onClick={() => requestSort(key)} className="group inline-flex items-center gap-1">
                <span>{label}</span>
                <Icon type={sortIcon} className={`h-4 w-4 transition-opacity ${isSorting ? 'opacity-100 text-gray-700' : 'opacity-0 text-gray-400 group-hover:opacity-100'}`} />
            </button>
        );
    };

    const openModal = (audit: LichAudit | null = null) => {
        setEditingAudit(audit);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingAudit(null);
        setIsModalOpen(false);
    };

    const handleSave = (formData: LichAudit) => {
        onUpdateData((prev: AllData) => {
            let newList;
            if (editingAudit) {
                newList = prev.auditSchedules.map(item => item.id === editingAudit.id ? formData : item);
            } else {
                newList = [...prev.auditSchedules, { ...formData, id: `audit-${uuidv4()}` }];
            }
            return { ...prev, auditSchedules: newList };
        });
        closeModal();
    };

    const handleDelete = () => {
        if (!deletingId) return;
        onUpdateData((prev: AllData) => ({
            ...prev,
            auditSchedules: prev.auditSchedules.filter(item => item.id !== deletingId),
        }));
        setDeletingId(null);
    };
    
    const canManage = currentUser.role === 'admin';
    
    const deletionInfo = useMemo(() => {
        if (!deletingId) return { title: '', message: '' };
        const audit = allData.auditSchedules.find(a => a.id === deletingId);
        return {
            title: 'Xác nhận Xóa Lịch Audit',
            message: `Bạn có chắc chắn muốn xóa cuộc audit '${audit?.ten_cuoc_audit || ''}' không? Hành động này không thể hoàn tác.`,
        };
    }, [deletingId, allData.auditSchedules]);
    
    const handlePrint = () => window.print();
    const handleExportCsv = () => {
        const dataToExport = sortedAudits.map(s => ({
            ten_cuoc_audit: s.ten_cuoc_audit,
            loai_audit: s.loai_audit === 'internal' ? 'Nội bộ' : 'Bên ngoài',
            ngay_bat_dau: formatDateForDisplay(s.ngay_bat_dau),
            ngay_ket_thuc: formatDateForDisplay(s.ngay_ket_thuc),
            truong_doan: danhGiaVienMap.get(s.chuyen_gia_danh_gia_truong_id),
            trang_thai: translate(s.trang_thai),
        }));
        const headers = {
            ten_cuoc_audit: 'Tên cuộc audit', loai_audit: 'Loại', ngay_bat_dau: 'Ngày bắt đầu',
            ngay_ket_thuc: 'Ngày kết thúc', truong_doan: 'Trưởng đoàn', trang_thai: 'Trạng thái'
        };
        exportToCsv(dataToExport, headers, 'danh_sach_lich_audit.csv');
    };
    const handleExportWord = () => exportVisibleReportToWord('danh_sach_lich_audit');


    return (
        <>
            <PrintReportLayout {...printLayoutProps} currentUser={currentUser} />
            <div className="space-y-6 no-print">
                <h1 className="text-3xl font-bold text-gray-900">Lịch audit</h1>
                <p className="text-sm text-gray-500">
                    Lên kế hoạch và theo dõi các cuộc đánh giá nội bộ và bên ngoài.
                </p>

                <Card>
                    <Card.Body>
                         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start-date" className="form-label">Lọc từ ngày</label>
                                    <DatePicker id="start-date" value={dateFilter.start} onChange={(val) => setDateFilter(p => ({ ...p, start: val }))} />
                                </div>
                                <div>
                                    <label htmlFor="end-date" className="form-label">Đến ngày</label>
                                    <DatePicker id="end-date" value={dateFilter.end} onChange={(val) => setDateFilter(p => ({ ...p, end: val }))} />
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2 self-start sm:self-end">
                                <div className="hidden items-center rounded-md shadow-sm md:flex">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('calendar')}
                                        className={`relative inline-flex items-center justify-center whitespace-nowrap rounded-l-md border px-4 py-2.5 text-sm font-medium focus:z-10 transition-colors duration-150 ${
                                            viewMode === 'calendar'
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon type="calendar" className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Lịch
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('list')}
                                        className={`relative -ml-px inline-flex items-center justify-center whitespace-nowrap rounded-r-md border px-4 py-2.5 text-sm font-medium focus:z-10 transition-colors duration-150 ${
                                            viewMode === 'list'
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon type="clipboard-document-list" className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Danh sách
                                    </button>
                                </div>
                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={() => openModal()}
                                        className="btn-primary"
                                    >
                                        <Icon type="plus" className="-ml-1 mr-2 h-5 w-5" />
                                        Thêm mới
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {viewMode === 'calendar' ? (
                     <div className="hidden md:block">
                        <CalendarView 
                            currentDate={calendarDate}
                            setCurrentDate={setCalendarDate}
                            events={calendarEvents}
                            onEventClick={(audit) => canManage && openModal(audit)}
                        />
                    </div>
                ) : null}

                {viewMode === 'list' ? (
                    <Card>
                        <Card.Header>
                            <ExportDropdown onPrint={handlePrint} onExportCsv={handleExportCsv} onExportWord={handleExportWord} />
                        </Card.Header>

                        {/* Mobile View */}
                        <div className="md:hidden">
                            {paginatedAudits.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {paginatedAudits.map(audit => (
                                        <li key={audit.id} className="p-4 hover:bg-slate-50" onClick={() => canManage && openModal(audit)}>
                                            <div className="flex items-start justify-between gap-4">
                                                <p className="font-semibold text-gray-900 flex-1">{audit.ten_cuoc_audit}</p>
                                                <Badge status={audit.trang_thai} />
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                                                <p><span className="font-medium text-gray-500 w-20 inline-block">Thời gian:</span> {formatDateForDisplay(audit.ngay_bat_dau)} - {formatDateForDisplay(audit.ngay_ket_thuc)}</p>
                                                <p><span className="font-medium text-gray-500 w-20 inline-block">Trưởng đoàn:</span> {danhGiaVienMap.get(audit.chuyen_gia_danh_gia_truong_id) || 'N/A'}</p>
                                                <p><span className="font-medium text-gray-500 w-20 inline-block">Loại:</span> {audit.loai_audit === 'internal' ? 'Nội bộ' : `Bên ngoài (${toChucDanhGiaMap.get(audit.to_chuc_danh_gia_id || '') || 'N/A'})`}</p>
                                            </div>
                                             {canManage && (
                                                <div className="mt-3 flex justify-end space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); openModal(audit); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Sửa"><Icon type="pencil" className="h-5 w-5" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setDeletingId(audit.id); }} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Xóa"><Icon type="trash" className="h-5 w-5" /></button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không có lịch audit nào.</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table<LichAudit>
                                columns={[
                                    { header: getSortableHeader('Tên cuộc audit', 'ten_cuoc_audit'), accessor: 'ten_cuoc_audit' },
                                    { header: getSortableHeader('Loại', 'loai_audit'), accessor: (item) => item.loai_audit === 'internal' ? 'Nội bộ' : 'Bên ngoài' },
                                    { header: 'Tổ chức', accessor: (item) => item.loai_audit === 'external' ? toChucDanhGiaMap.get(item.to_chuc_danh_gia_id || '') : '' },
                                    { header: getSortableHeader('Ngày bắt đầu', 'ngay_bat_dau'), accessor: (item) => formatDateForDisplay(item.ngay_bat_dau) },
                                    { header: getSortableHeader('Ngày kết thúc', 'ngay_ket_thuc'), accessor: (item) => formatDateForDisplay(item.ngay_ket_thuc) },
                                    { header: 'Trưởng đoàn', accessor: (item) => danhGiaVienMap.get(item.chuyen_gia_danh_gia_truong_id) },
                                    { header: getSortableHeader('Trạng thái', 'trang_thai'), accessor: (item) => <Badge status={item.trang_thai} /> },
                                ]}
                                data={paginatedAudits}
                                actions={canManage ? (item) => (
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:text-blue-800" title="Sửa"><Icon type="pencil" className="h-4 w-4" /></button>
                                        <button onClick={() => setDeletingId(item.id)} className="p-2 text-red-600 hover:text-red-800" title="Xóa"><Icon type="trash" className="h-4 w-4" /></button>
                                    </div>
                                ) : undefined}
                                onRowClick={(item) => canManage && openModal(item)}
                            />
                        </div>
                        {sortedAudits.length > 0 && (
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}>
                                 <div className="flex items-center gap-x-4">
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                        - <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedAudits.length)}</span>
                                        {' '}trên <span className="font-medium">{sortedAudits.length}</span> mục
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="items-per-page" className="text-sm text-gray-700">Dòng/trang:</label>
                                        <select id="items-per-page" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="form-select py-1 w-auto">
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                            </Pagination>
                        )}
                    </Card>
                ) : null}

                {canManage && (
                     <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAudit ? 'Chỉnh sửa Lịch Audit' : 'Thêm mới Lịch Audit'}>
                        <AuditScheduleForm
                            id="audit-form"
                            onSubmit={handleSave}
                            onCancel={closeModal}
                            initialData={editingAudit}
                            categories={{ 
                                nhanSu: allData.nhanSu, 
                                tieuChuan: allData.tieuChuan, 
                                documents: allData.documents,
                                danhGiaVien: allData.danhGiaVien,
                                toChucDanhGia: allData.toChucDanhGia,
                            }}
                        />
                         <Modal.Footer>
                            <button type="button" onClick={closeModal} className="btn-secondary">Hủy</button>
                            <button type="submit" form="audit-form" className="btn-primary">Lưu</button>
                        </Modal.Footer>
                    </Modal>
                )}
                
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

export default AuditManagementPage;