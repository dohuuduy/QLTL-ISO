import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LichAudit, NhanSu, TieuChuan, DanhMucTaiLieu, DanhGiaVien, ToChucDanhGia } from '../../types';
import { AuditStatus } from '../../constants';
import DatePicker from '../ui/DatePicker';
import { translate } from '../../utils/translations';
import { Icon } from '../ui/Icon';

interface AuditScheduleFormProps {
    id: string;
    onSubmit: (data: LichAudit) => void;
    onCancel: () => void;
    initialData?: LichAudit | null;
    categories: {
        nhanSu: NhanSu[];
        tieuChuan: TieuChuan[];
        documents: DanhMucTaiLieu[];
        danhGiaVien: DanhGiaVien[];
        toChucDanhGia: ToChucDanhGia[];
    };
}

const AuditScheduleForm: React.FC<AuditScheduleFormProps> = ({ id, onSubmit, onCancel, initialData, categories }) => {
    const getInitialState = (): Omit<LichAudit, 'id'> => ({
        ten_cuoc_audit: '',
        loai_audit: 'internal',
        to_chuc_danh_gia_id: '',
        tieu_chuan_ids: [],
        pham_vi: '',
        ngay_bat_dau: new Date().toISOString().split('T')[0],
        ngay_ket_thuc: new Date().toISOString().split('T')[0],
        chuyen_gia_danh_gia_truong_id: '',
        doan_danh_gia_ids: [],
        trang_thai: AuditStatus.PLANNED,
        ghi_chu: '',
        tai_lieu_lien_quan_ids: [],
    });

    const [formData, setFormData] = useState(getInitialState());
    const [dateError, setDateError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...getInitialState(),
                ...initialData
            });
        } else {
            setFormData(getInitialState());
        }
    }, [initialData]);

    useEffect(() => {
        const startDate = new Date(formData.ngay_bat_dau);
        const endDate = new Date(formData.ngay_ket_thuc);
        if (endDate < startDate) {
            setDateError('Ngày kết thúc không được trước ngày bắt đầu.');
        } else {
            setDateError(null);
        }
    }, [formData.ngay_bat_dau, formData.ngay_ket_thuc]);
    
    const getStandardDisplay = (item: TieuChuan | undefined) => {
        if (!item) return '';
        const details = [item.phien_ban, item.ten_viet_tat].filter(Boolean).join(' / ');
        return details ? `${item.ten} (${details})` : item.ten;
    };
    
    const getDocumentDisplay = (item: DanhMucTaiLieu | undefined) => {
        if (!item) return '';
        return `${item.ten_tai_lieu} (${item.ma_tl})`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'loai_audit' && value === 'internal') {
                newState.to_chuc_danh_gia_id = '';
            }
            return newState;
        });
    };

    const handleDateChange = (name: keyof LichAudit, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (dateError) return;
        onSubmit({
            ...(initialData || { id: '' }),
            ...formData,
        });
    };
    
    // Helper component for multi-select dropdowns
    const MultiSelectDropdown: React.FC<{
        label: string;
        items: any[];
        selectedIds: string[];
        onAdd: (id: string) => void;
        onRemove: (id: string) => void;
        getDisplay: (item: any) => string;
        placeholder: string;
    }> = ({ label, items, selectedIds, onAdd, onRemove, getDisplay, placeholder }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);
        
        const availableItems = useMemo(() => {
            return items
                .filter(item => 
                    item &&
                    (item.is_active !== false) &&
                    !selectedIds.includes(item.id) &&
                    getDisplay(item).toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => getDisplay(a).localeCompare(getDisplay(b)));
        }, [items, selectedIds, searchTerm, getDisplay]);

        return (
             <div ref={dropdownRef} className="relative">
                <label className={labelStyles}>{label}</label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(prev => !prev)}
                        className={`${inputStyles} border-gray-300 flex items-center justify-between text-left`}
                    >
                        <div className="flex flex-wrap gap-2 items-center min-h-[22px]">
                            {selectedIds.length > 0 ? (
                                selectedIds.map(id => {
                                    const item = items.find(i => i.id === id);
                                    return (
                                        <span key={id} className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                            {item ? getDisplay(item) : id}
                                            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(id); }} className="h-3.5 w-3.5 rounded-full text-blue-600 hover:bg-blue-200">
                                                <Icon type="x-mark" className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-gray-400">{placeholder}</span>
                            )}
                        </div>
                        <Icon type="chevron-down" className="h-5 w-5 text-gray-400" />
                    </button>
                    {isOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-gray-200">
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm..." className="w-full rounded-md border-gray-300 py-1.5 px-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                            </div>
                            <ul className="overflow-y-auto">
                                {availableItems.length > 0 ? (
                                    availableItems.map(item => (
                                        <li key={item.id || item.ma_tl} onClick={() => onAdd(item.id || item.ma_tl)} className="px-3 py-2 text-sm text-gray-800 hover:bg-slate-100 cursor-pointer">
                                            {getDisplay(item)}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-2 text-sm text-gray-500">Không tìm thấy.</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleMultiSelectChange = (field: 'tieu_chuan_ids' | 'doan_danh_gia_ids' | 'tai_lieu_lien_quan_ids', action: 'add' | 'remove', id: string) => {
        setFormData(prev => {
            const currentIds = prev[field] || [];
            let newIds;
            if (action === 'add') {
                newIds = [...currentIds, id];
            } else {
                newIds = currentIds.filter(currentId => currentId !== id);
            }
            return { ...prev, [field]: newIds };
        });
    };

    const inputStyles = "mt-1 block w-full rounded-md bg-white py-2.5 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-900";

    return (
        <form id={id} onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="ten_cuoc_audit" className={labelStyles}>Tên cuộc audit</label>
                        <input type="text" name="ten_cuoc_audit" id="ten_cuoc_audit" value={formData.ten_cuoc_audit} onChange={handleChange} className={`${inputStyles} border-gray-300`} required placeholder="VD: Đánh giá nội bộ Quý 3/2024" />
                    </div>
                    <div>
                        <label htmlFor="loai_audit" className={labelStyles}>Loại audit</label>
                        <select name="loai_audit" id="loai_audit" value={formData.loai_audit} onChange={handleChange} className={`${inputStyles} border-gray-300`} required>
                            <option value="internal">Nội bộ</option>
                            <option value="external">Bên ngoài</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="trang_thai" className={labelStyles}>Trạng thái</label>
                        <select name="trang_thai" id="trang_thai" value={formData.trang_thai} onChange={handleChange} className={`${inputStyles} border-gray-300`} required>
                            {Object.values(AuditStatus).map(s => <option key={s} value={s}>{translate(s)}</option>)}
                        </select>
                    </div>
                </div>

                {formData.loai_audit === 'external' && (
                    <div>
                        <label htmlFor="to_chuc_danh_gia_id" className={labelStyles}>Tổ chức đánh giá</label>
                        <select name="to_chuc_danh_gia_id" id="to_chuc_danh_gia_id" value={formData.to_chuc_danh_gia_id} onChange={handleChange} className={`${inputStyles} border-gray-300`} required>
                            <option value="">-- Chọn tổ chức --</option>
                            {categories.toChucDanhGia.filter(o => o.is_active).map(org => <option key={org.id} value={org.id}>{org.ten}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="pham_vi" className={labelStyles}>Phạm vi</label>
                    <textarea name="pham_vi" id="pham_vi" rows={2} value={formData.pham_vi} onChange={handleChange} className={`${inputStyles} border-gray-300`} placeholder="Mô tả phạm vi của cuộc đánh giá..." />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <label htmlFor="ngay_bat_dau" className={labelStyles}>Ngày bắt đầu</label>
                        <DatePicker id="ngay_bat_dau" value={formData.ngay_bat_dau} onChange={(val) => handleDateChange('ngay_bat_dau', val)} className={`${inputStyles} ${dateError ? 'border-red-500' : 'border-gray-300'}`} required />
                    </div>
                    <div>
                        <label htmlFor="ngay_ket_thuc" className={labelStyles}>Ngày kết thúc</label>
                        <DatePicker id="ngay_ket_thuc" value={formData.ngay_ket_thuc} onChange={(val) => handleDateChange('ngay_ket_thuc', val)} className={`${inputStyles} ${dateError ? 'border-red-500' : 'border-gray-300'}`} required />
                        {dateError && <p className="mt-1 text-sm text-red-600">{dateError}</p>}
                    </div>
                </div>

                <div>
                    <MultiSelectDropdown
                        label="Tiêu chuẩn áp dụng"
                        items={categories.tieuChuan}
                        selectedIds={formData.tieu_chuan_ids}
                        onAdd={(id) => handleMultiSelectChange('tieu_chuan_ids', 'add', id)}
                        onRemove={(id) => handleMultiSelectChange('tieu_chuan_ids', 'remove', id)}
                        getDisplay={getStandardDisplay}
                        placeholder="Chọn các tiêu chuẩn..."
                    />
                </div>

                <div>
                    <MultiSelectDropdown
                        label="Tài liệu liên quan (tùy chọn)"
                        items={categories.documents.map(d => ({ ...d, id: d.ma_tl }))}
                        selectedIds={formData.tai_lieu_lien_quan_ids || []}
                        onAdd={(id) => handleMultiSelectChange('tai_lieu_lien_quan_ids', 'add', id)}
                        onRemove={(id) => handleMultiSelectChange('tai_lieu_lien_quan_ids', 'remove', id)}
                        getDisplay={getDocumentDisplay}
                        placeholder="Chọn các tài liệu liên quan..."
                    />
                </div>
                
                 <div>
                    <label htmlFor="chuyen_gia_danh_gia_truong_id" className={labelStyles}>Trưởng đoàn đánh giá</label>
                    <select name="chuyen_gia_danh_gia_truong_id" id="chuyen_gia_danh_gia_truong_id" value={formData.chuyen_gia_danh_gia_truong_id} onChange={handleChange} className={`${inputStyles} border-gray-300`} required>
                        <option value="">-- Chọn trưởng đoàn --</option>
                        {categories.danhGiaVien.filter(u => u.is_active).map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                    </select>
                </div>
                
                <div>
                     <MultiSelectDropdown
                        label="Thành viên đoàn đánh giá"
                        items={categories.danhGiaVien}
                        selectedIds={formData.doan_danh_gia_ids}
                        onAdd={(id) => handleMultiSelectChange('doan_danh_gia_ids', 'add', id)}
                        onRemove={(id) => handleMultiSelectChange('doan_danh_gia_ids', 'remove', id)}
                        getDisplay={(item: NhanSu) => item.ten}
                        placeholder="Chọn thành viên..."
                    />
                </div>

                 <div>
                    <label htmlFor="ghi_chu" className={labelStyles}>Ghi chú (tùy chọn)</label>
                    <textarea name="ghi_chu" id="ghi_chu" rows={2} value={formData.ghi_chu} onChange={handleChange} className={`${inputStyles} border-gray-300`} placeholder="Thêm ghi chú nếu cần..." />
                </div>
            </div>
        </form>
    );
};

export default AuditScheduleForm;