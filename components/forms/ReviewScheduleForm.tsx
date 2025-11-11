import React, { useState, useEffect } from 'react';
import type { LichRaSoat, NhanSu, TanSuatRaSoat } from '../../types';
import { ReviewResult } from '../../constants';
import { translate } from '../../utils/translations';
import DatePicker from '../ui/DatePicker';

interface ReviewScheduleFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: Partial<LichRaSoat> | null;
    ma_tl: string;
    nhanSuList: NhanSu[];
    tanSuatList: TanSuatRaSoat[];
}

const ReviewScheduleForm: React.FC<ReviewScheduleFormProps> = ({ onSubmit, onCancel, initialData, ma_tl, nhanSuList, tanSuatList }) => {
    const getInitialState = (data?: Partial<LichRaSoat> | null) => ({
        tan_suat: data?.tan_suat || '',
        ngay_ra_soat_ke_tiep: data?.ngay_ra_soat_ke_tiep || '',
        nguoi_chiu_trach_nhiem: data?.nguoi_chiu_trach_nhiem || '',
        ngay_ra_soat_thuc_te: data?.ngay_ra_soat_thuc_te || '',
        ket_qua_ra_soat: data?.ket_qua_ra_soat || '',
        ghi_chu: data?.ghi_chu || '',
    });

    const [formData, setFormData] = useState(getInitialState(initialData));

    useEffect(() => {
        setFormData(getInitialState(initialData));
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submittedData = {
            ...initialData,
            ...formData,
            ma_tl,
            ket_qua_ra_soat: formData.ket_qua_ra_soat || undefined,
            ngay_ra_soat_thuc_te: formData.ngay_ra_soat_thuc_te || undefined,
        };
        onSubmit(submittedData);
    };
    
    const activeOrCurrentlySelected = (list: any[], selectedId: string) => 
        list.filter(item => item.is_active !== false || item.id === selectedId);
    
    const isLoggingResult = !!formData.ket_qua_ra_soat;

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ngay_ra_soat_ke_tiep" className="form-label">Ngày rà soát kế tiếp</label>
                        <DatePicker id="ngay_ra_soat_ke_tiep" value={formData.ngay_ra_soat_ke_tiep} onChange={value => handleDateChange('ngay_ra_soat_ke_tiep', value)} required />
                    </div>
                    <div>
                        <label htmlFor="tan_suat" className="form-label">Tần suất</label>
                        <select name="tan_suat" id="tan_suat" value={formData.tan_suat} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn tần suất</option>
                            {activeOrCurrentlySelected(tanSuatList, formData.tan_suat).map(ts => <option key={ts.id} value={ts.id}>{ts.ten}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="nguoi_chiu_trach_nhiem" className="form-label">Người chịu trách nhiệm</label>
                    <select name="nguoi_chiu_trach_nhiem" id="nguoi_chiu_trach_nhiem" value={formData.nguoi_chiu_trach_nhiem} onChange={handleChange} className="form-select" required>
                        <option value="">Chọn người</option>
                        {nhanSuList.filter(u => u.is_active !== false || u.id === formData.nguoi_chiu_trach_nhiem).map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                    </select>
                </div>
                
                 <div className="border-t border-gray-200 pt-4 space-y-4">
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                         <div>
                            <label htmlFor="ket_qua_ra_soat" className="form-label">Kết quả rà soát (tùy chọn)</label>
                            <select name="ket_qua_ra_soat" id="ket_qua_ra_soat" value={formData.ket_qua_ra_soat} onChange={handleChange} className="form-select">
                                <option value="">Chưa có</option>
                                {Object.values(ReviewResult).map(val => <option key={val} value={val}>{translate(val)}</option>)}
                            </select>
                        </div>
                        {isLoggingResult && (
                             <div>
                                <label htmlFor="ngay_ra_soat_thuc_te" className="form-label">Ngày rà soát thực tế</label>
                                <DatePicker id="ngay_ra_soat_thuc_te" value={formData.ngay_ra_soat_thuc_te} onChange={value => handleDateChange('ngay_ra_soat_thuc_te', value)} required />
                            </div>
                        )}
                    </div>
                </div>
                 <div>
                    <label htmlFor="ghi_chu" className="form-label">Ghi chú</label>
                    <textarea name="ghi_chu" id="ghi_chu" value={formData.ghi_chu} onChange={handleChange} rows={3} className="form-textarea" placeholder="Thêm ghi chú nếu có..." />
                </div>
                {isLoggingResult && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                        <p><strong>Lưu ý:</strong> Khi bạn lưu lại với kết quả rà soát, lịch này sẽ được đánh dấu là hoàn thành và một lịch mới cho chu kỳ tiếp theo sẽ được tự động tạo ra.</p>
                    </div>
                )}
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </div>
        </form>
    );
};

export default ReviewScheduleForm;