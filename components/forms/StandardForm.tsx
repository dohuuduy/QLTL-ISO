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

    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 bg-white py-2.5 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ten" className={labelStyles}>Tên đầy đủ</label>
                    <input type="text" name="ten" id="ten" value={formData.ten} onChange={handleChange} className={inputStyles} required placeholder="VD: ISO 9001 - Hệ thống quản lý chất lượng" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ten_viet_tat" className={labelStyles}>Tên viết tắt (tùy chọn)</label>
                        <input type="text" name="ten_viet_tat" id="ten_viet_tat" value={formData.ten_viet_tat} onChange={handleChange} className={inputStyles} placeholder="VD: QMS" />
                    </div>
                    <div>
                        <label htmlFor="phien_ban" className={labelStyles}>Phiên bản (tùy chọn)</label>
                        <input type="text" name="phien_ban" id="phien_ban" value={formData.phien_ban} onChange={handleChange} className={inputStyles} placeholder="VD: 2015" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ngay_ap_dung" className={labelStyles}>Ngày bắt đầu áp dụng</label>
                        <DatePicker id="ngay_ap_dung" value={formData.ngay_ap_dung} onChange={(val) => handleDateChange('ngay_ap_dung', val)} className={inputStyles} required />
                    </div>
                    <div>
                        <label htmlFor="ngay_ket_thuc_ap_dung" className={labelStyles}>Ngày kết thúc áp dụng (tùy chọn)</label>
                        <DatePicker id="ngay_ket_thuc_ap_dung" value={formData.ngay_ket_thuc_ap_dung} onChange={(val) => handleDateChange('ngay_ket_thuc_ap_dung', val)} className={inputStyles} />
                        {dateError && <p className="mt-2 text-sm text-red-600">{dateError}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="mo_ta" className={labelStyles}>Mô tả (tùy chọn)</label>
                    <textarea name="mo_ta" id="mo_ta" value={formData.mo_ta} onChange={handleChange} rows={3} className={inputStyles} placeholder="Mô tả ngắn gọn về tiêu chuẩn..." />
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Hủy</button>
                <button type="submit" disabled={!!dateError} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed">Lưu</button>
            </div>
        </form>
    );
};

export default StandardForm;