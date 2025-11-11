import React, { useState, useEffect } from 'react';
import type { TieuChuan } from '../../types';
import DatePicker from '../ui/DatePicker';

interface StandardFormProps {
    onSubmit: (data: TieuChuan) => void;
    onCancel: () => void;
    initialData?: TieuChuan | null;
}

const StandardForm: React.FC<StandardFormProps> = ({ onSubmit, onCancel, initialData }) => {
    const getInitialState = (): Omit<TieuChuan, 'id' | 'is_active'> => ({
        ten: '',
        ten_viet_tat: '',
        phien_ban: '',
        ngay_ap_dung: new Date().toISOString().split('T')[0],
        ngay_ket_thuc_ap_dung: undefined,
        mo_ta: '',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [dateError, setDateError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ten: initialData.ten || '',
                ten_viet_tat: initialData.ten_viet_tat || '',
                phien_ban: initialData.phien_ban || '',
                ngay_ap_dung: initialData.ngay_ap_dung || new Date().toISOString().split('T')[0],
                ngay_ket_thuc_ap_dung: initialData.ngay_ket_thuc_ap_dung || undefined,
                mo_ta: initialData.mo_ta || '',
            });
        } else {
            setFormData(getInitialState());
        }
    }, [initialData]);

    useEffect(() => {
        const startDate = formData.ngay_ap_dung ? new Date(formData.ngay_ap_dung) : null;
        const endDate = formData.ngay_ket_thuc_ap_dung ? new Date(formData.ngay_ket_thuc_ap_dung) : null;

        if (startDate && endDate && endDate < startDate) {
            setDateError('Ngày kết thúc không được trước ngày bắt đầu.');
        } else {
            setDateError(null);
        }
    }, [formData.ngay_ap_dung, formData.ngay_ket_thuc_ap_dung]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (dateError) return;
        onSubmit({
            ...(initialData || { id: '', is_active: true }),
            ...formData,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ten" className="form-label">Tên đầy đủ</label>
                    <input type="text" name="ten" id="ten" value={formData.ten} onChange={handleChange} className="form-input" required placeholder="VD: ISO 9001 - Hệ thống quản lý chất lượng" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ten_viet_tat" className="form-label">Tên viết tắt (tùy chọn)</label>
                        <input type="text" name="ten_viet_tat" id="ten_viet_tat" value={formData.ten_viet_tat} onChange={handleChange} className="form-input" placeholder="VD: QMS" />
                    </div>
                    <div>
                        <label htmlFor="phien_ban" className="form-label">Phiên bản (tùy chọn)</label>
                        <input type="text" name="phien_ban" id="phien_ban" value={formData.phien_ban} onChange={handleChange} className="form-input" placeholder="VD: 2015" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ngay_ap_dung" className="form-label">Ngày bắt đầu áp dụng</label>
                        <DatePicker id="ngay_ap_dung" value={formData.ngay_ap_dung} onChange={(val) => handleDateChange('ngay_ap_dung', val)} required />
                    </div>
                    <div>
                        <label htmlFor="ngay_ket_thuc_ap_dung" className="form-label">Ngày kết thúc áp dụng (tùy chọn)</label>
                        <DatePicker id="ngay_ket_thuc_ap_dung" value={formData.ngay_ket_thuc_ap_dung} onChange={(val) => handleDateChange('ngay_ket_thuc_ap_dung', val)} />
                        {dateError && <p className="mt-2 text-sm text-red-600">{dateError}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="mo_ta" className="form-label">Mô tả (tùy chọn)</label>
                    <textarea name="mo_ta" id="mo_ta" value={formData.mo_ta} onChange={handleChange} rows={3} className="form-textarea" placeholder="Mô tả ngắn gọn về tiêu chuẩn..." />
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={!!dateError} className="btn-primary"
                >Lưu</button>
            </div>
        </form>
    );
};

export default StandardForm;