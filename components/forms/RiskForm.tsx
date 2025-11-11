import React, { useState, useEffect } from 'react';
import type { RuiRoCoHoi, NhanSu } from '../../types';
import { RiskStatus } from '../../constants';
import { translate } from '../../utils/translations';
import DatePicker from '../ui/DatePicker';

interface RiskFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: Partial<RuiRoCoHoi> | null;
    ma_tl: string;
    nhanSuList: NhanSu[];
}

const RiskForm: React.FC<RiskFormProps> = ({ onSubmit, onCancel, initialData, ma_tl, nhanSuList }) => {
    const [formData, setFormData] = useState({
        loai: 'rui_ro' as 'rui_ro' | 'co_hoi',
        mo_ta: '',
        muc_do_anh_huong: 'trung_binh' as 'cao' | 'trung_binh' | 'thap',
        hanh_dong_phong_ngua: '',
        nguoi_phu_trach: '',
        ngay_nhan_dien: new Date().toISOString().split('T')[0],
        trang_thai: RiskStatus.MO,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                loai: initialData.loai || 'rui_ro',
                mo_ta: initialData.mo_ta || '',
                muc_do_anh_huong: initialData.muc_do_anh_huong || 'trung_binh',
                hanh_dong_phong_ngua: initialData.hanh_dong_phong_ngua || '',
                nguoi_phu_trach: initialData.nguoi_phu_trach || '',
                ngay_nhan_dien: initialData.ngay_nhan_dien || new Date().toISOString().split('T')[0],
                trang_thai: initialData.trang_thai || RiskStatus.MO,
            });
        }
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
        onSubmit({ ...initialData, ...formData, ma_tl });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <label htmlFor="loai" className="form-label">Loại</label>
                        <select name="loai" id="loai" value={formData.loai} onChange={handleChange} className="form-select" required>
                            <option value="rui_ro">Rủi ro</option>
                            <option value="co_hoi">Cơ hội</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="muc_do_anh_huong" className="form-label">Mức độ ảnh hưởng</label>
                        <select name="muc_do_anh_huong" id="muc_do_anh_huong" value={formData.muc_do_anh_huong} onChange={handleChange} className="form-select" required>
                            <option value="cao">Cao</option>
                            <option value="trung_binh">Trung bình</option>
                            <option value="thap">Thấp</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="mo_ta" className="form-label">Mô tả</label>
                    <textarea name="mo_ta" id="mo_ta" value={formData.mo_ta} onChange={handleChange} rows={3} className="form-textarea" required placeholder="Mô tả chi tiết về rủi ro hoặc cơ hội" />
                </div>

                <div>
                    <label htmlFor="hanh_dong_phong_ngua" className="form-label">Hành động phòng ngừa/khai thác</label>
                    <textarea name="hanh_dong_phong_ngua" id="hanh_dong_phong_ngua" value={formData.hanh_dong_phong_ngua} onChange={handleChange} rows={3} className="form-textarea" placeholder="Các hành động cần thực hiện" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <label htmlFor="nguoi_phu_trach" className="form-label">Người phụ trách</label>
                        <select name="nguoi_phu_trach" id="nguoi_phu_trach" value={formData.nguoi_phu_trach} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn người</option>
                            {nhanSuList.map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="ngay_nhan_dien" className="form-label">Ngày nhận diện</label>
                        <DatePicker id="ngay_nhan_dien" value={formData.ngay_nhan_dien} onChange={value => handleDateChange('ngay_nhan_dien', value)} required />
                    </div>
                </div>

                <div>
                    <label htmlFor="trang_thai" className="form-label">Trạng thái</label>
                    <select name="trang_thai" id="trang_thai" value={formData.trang_thai} onChange={handleChange} className="form-select" required>
                        {Object.values(RiskStatus).map(status => (
                            <option key={status} value={status}>{translate(status)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </div>
        </form>
    );
};

export default RiskForm;