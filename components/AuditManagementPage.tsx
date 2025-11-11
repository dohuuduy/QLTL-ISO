import React, { useState, useMemo } from 'react';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAudit, setEditingAudit] = useState<LichAudit | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ngay_bat_dau', direction: 'descending' });
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    
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

    const sortedAudits = useMemo(() => {
        let sortableItems = [...filteredAudits];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

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
    }, [filteredAudits, sortConfig]);

    const printLayoutProps = useMemo(() => {
        const filters: Record<string, string> = {};
        if (dateFilter.start) filters['Từ ngày'] = formatDateForDisplay(dateFilter.start);
        if (dateFilter.end) filters['Đến ngày'] = formatDateForDisplay(dateFilter.end);
        
        return {
            title: 'LỊCH SỬ AUDIT',
            filters,
            columns: [
                 { header: 'Tên cuộc audit', accessor: (item: LichAudit) => item.ten_cuoc_audit },
                 { header: 'Loại', accessor: (item: LichAudit) => item.loai_audit === 'internal' ? 'Nội bộ' : 'Bên ngoài' },
                 { header: 'Trạng thái', accessor: (item: LichAudit) => translate(item.trang_thai) },
                 { header: 'Ngày bắt đầu', accessor: (item: LichAudit) => formatDateForDisplay(item.ngay_bat_dau) },
                 { header: 'Trưởng đoàn', accessor: (item: LichAudit) => danhGiaVienMap.get(item.chuyen_gia_danh_gia_truong_id) || '' },
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
        onUpdateData((prev: any) => {
            const list = prev.auditSchedules;
            let newList;
            if (editingAudit && editingAudit.id) {
                newList = list.map((item: LichAudit) => item.id === editingAudit.id ? formData : item);
            } else {
                newList = [...list, { ...formData, id: `audit-${uuidv4()}` }];
            }
            return { ...prev, auditSchedules: newList };
        });
        closeModal();
    };

    const handleDelete = () => {
        if (!deletingId) return;
        onUpdateData((prev: any) => ({
            ...prev,
            auditSchedules: prev.auditSchedules.filter((item: LichAudit) => item.id !== deletingId),
        }));
        setDeletingId(null);
    };
    
    const handleDateFilterChange = (field: 'start' | 'end', value: string) => {
        setDateFilter(prev => ({ ...prev, [field]: value }));
    };

    const clearDateFilter = () => {
        setDateFilter({ start: '', end: '' });
    };

    const handlePrint = () => window.print();

    const handleExportCsv = () => {
        const dataToExport = sortedAudits.map(audit => ({
            ten_cuoc_audit: audit.ten_cuoc_audit,
            loai_audit: audit.loai_audit === 'internal' ? 'Nội bộ' : `Bên ngoài (${toChucDanhGiaMap.get(audit.to_chuc_danh_gia_id || '') || 'N/A'})`,
            trang_thai: translate(audit.trang_thai),
            ngay_bat_dau: formatDateForDisplay(audit.ngay_bat_dau),
            ngay_ket_thuc: formatDateForDisplay(audit.ngay_ket_thuc),
            truong_doan: danhGiaVienMap.get(audit.chuyen_gia_danh_gia_truong_id) || '',
            thanh_vien: audit.doan_danh_gia_ids.map(id => danhGiaVienMap.get(id)).join('; '),
            pham_vi: audit.pham_vi
        }));

        const headers = {
            ten_cuoc_audit: 'Tên cuộc audit',
            loai_audit: 'Loại',
            trang_thai: 'Trạng thái',
            ngay_bat_dau: 'Ngày bắt đầu',
            ngay_ket_thuc: 'Ngày kết thúc',
            truong_doan: 'Trưởng đoàn',
            thanh_vien: 'Thành viên',
            pham_vi: 'Phạm vi'
        };

        exportToCsv(dataToExport, headers, 'lich_audit.csv');
    };

    const handleExportWord = () => {
        exportVisibleReportToWord('lich_audit');
    };

    const canManage = currentUser.role === 'admin';

    const renderActions = (item: LichAudit) => (
        <div className="flex items-center justify-end space-x-3">
            <button onClick={(e) => { e.stopPropagation(); openModal(item); }} className="text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
                <Icon type="pencil" className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }} className="text-red-600 hover:text-red-800" title="Xóa">
                <Icon type="trash" className="h-5 w-5" />
            </button>
        </div>
    );

    const deletionInfo = useMemo(() => {
        if (!deletingId) return { title: 'Xác nhận Xóa', message: 'Bạn có chắc chắn muốn xóa mục này không?' };
        const audit = allData.auditSchedules.find(s => s.id === deletingId);
        return {
            title: 'Xác nhận Xóa Lịch Audit',
            message: `Bạn có chắc chắn muốn xóa lịch audit '${audit?.ten_cuoc_audit || ''}' không? Hành động này không thể hoàn tác.`,
        };
    }, [deletingId, allData.auditSchedules]);

    return (
        <>
            <PrintReportLayout {...printLayoutProps} currentUser={currentUser} />
            <div className="space-y-6 no-print">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Lịch Audit</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Lên kế hoạch và theo dõi các cuộc đánh giá nội bộ và bên ngoài.
                        </p>
                    </div>
                    {canManage && (
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                            <button
                                type="button"
                                onClick={() => openModal()}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                            >
                                <Icon type="plus" className="-ml-1 mr-2 h-5 w-5" />
                                Thêm Lịch Audit
                            </button>
                        </div>
                    )}
                </div>
                
                <Card>
                    <Card.Body>
                         <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-900">Lọc từ ngày</label>
                                 <DatePicker
                                    id="start-date"
                                    value={dateFilter.start}
                                    onChange={(value) => handleDateFilterChange('start', value)}
                                    className="mt-1 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                            </div>
                             <div>
                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-900">Đến ngày</label>
                                <DatePicker
                                    id="end-date"
                                    value={dateFilter.end}
                                    onChange={(value) => handleDateFilterChange('end', value)}
                                    className="mt-1 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                            </div>
                             {(dateFilter.start || dateFilter.end) && (
                                 <button
                                    type="button"
                                    onClick={clearDateFilter}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                            <div className="ml-auto">
                                 <ExportDropdown onPrint={handlePrint} onExportCsv={handleExportCsv} onExportWord={handleExportWord} />
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card>
                    <Table<LichAudit>
                        columns={[
                            { header: getSortableHeader('Tên cuộc audit', 'ten_cuoc_audit'), accessor: 'ten_cuoc_audit', className: 'font-medium text-gray-900' },
                            { header: getSortableHeader('Loại', 'loai_audit'), accessor: (item) => {
                                    if (item.loai_audit === 'external') {
                                        const orgName = toChucDanhGiaMap.get(item.to_chuc_danh_gia_id || '');
                                        return `Bên ngoài ${orgName ? `(${orgName})` : ''}`;
                                    }
                                    return 'Nội bộ';
                                } 
                            },
                            { header: getSortableHeader('Trạng thái', 'trang_thai'), accessor: (item) => <Badge status={item.trang_thai} /> },
                            { header: getSortableHeader('Ngày bắt đầu', 'ngay_bat_dau'), accessor: (item) => formatDateForDisplay(item.ngay_bat_dau) },
                            { header: getSortableHeader('Ngày kết thúc', 'ngay_ket_thuc'), accessor: (item) => formatDateForDisplay(item.ngay_ket_thuc) },
                            { header: getSortableHeader('Trưởng đoàn', 'chuyen_gia_danh_gia_truong_id'), accessor: (item) => danhGiaVienMap.get(item.chuyen_gia_danh_gia_truong_id) },
                        ]}
                        data={sortedAudits}
                        actions={canManage ? renderActions : undefined}
                    />
                </Card>

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
                        <button type="button" onClick={closeModal} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Hủy</button>
                        <button type="submit" form="audit-form" className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            Lưu
                        </button>
                    </Modal.Footer>
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

export default AuditManagementPage;