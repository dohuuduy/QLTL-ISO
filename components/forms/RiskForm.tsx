import React, { useState, useEffect } from 'react';
import type { RuiRoCoHoi, NhanSu } from '../../types';
import { RiskStatus } from '../../constants';
import { translate } from '../../utils/translations';
import DatePicker from '../ui/DatePicker';
import Modal from '../ui/Modal';

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

    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 py-2.5 px-3 text-gray-900 dark:text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-gray-400 dark:placeholder-slate-500";
    const labelStyles = "block text-sm font-medium text-gray-900 dark:text-slate-200";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <label htmlFor="loai" className={labelStyles}>Loại</label>
                        <select name="loai" id="loai" value={formData.loai} onChange={handleChange} className={inputStyles} required>
                            <option value="rui_ro">Rủi ro</option>
                            <option value="co_hoi">Cơ hội</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="muc_do_anh_huong" className={labelStyles}>Mức độ ảnh hưởng</label>
                        <select name="muc_do_anh_huong" id="muc_do_anh_huong" value={formData.muc_do_anh_huong} onChange={handleChange} className={inputStyles} required>
                            <option value="cao">Cao</option>
                            <option value="trung_binh">Trung bình</option>
                            <option value="thap">Thấp</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="mo_ta" className={labelStyles}>Mô tả</label>
                    <textarea name="mo_ta" id="mo_ta" value={formData.mo_ta} onChange={handleChange} rows={3} className={inputStyles} required placeholder="Mô tả chi tiết về rủi ro hoặc cơ hội" />
                </div>

                <div>
                    <label htmlFor="hanh_dong_phong_ngua" className={labelStyles}>Hành động phòng ngừa/khai thác</label>
                    <textarea name="hanh_dong_phong_ngua" id="hanh_dong_phong_ngua" value={formData.hanh_dong_phong_ngua} onChange={handleChange} rows={3} className={inputStyles} placeholder="Các hành động cần thực hiện" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <label htmlFor="nguoi_phu_trach" className={labelStyles}>Người phụ trách</label>
                        <select name="nguoi_phu_trach" id="nguoi_phu_trach" value={formData.nguoi_phu_trach} onChange={handleChange} className={inputStyles} required>
                            <option value="">Chọn người</option>
                            {nhanSuList.map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="ngay_nhan_dien" className={labelStyles}>Ngày nhận diện</label>
                        <DatePicker id="ngay_nhan_dien" value={formData.ngay_nhan_dien} onChange={value => handleDateChange('ngay_nhan_dien', value)} required className={inputStyles} />
                    </div>
                </div>

                <div>
                    <label htmlFor="trang_thai" className={labelStyles}>Trạng thái</label>
                    <select name="trang_thai" id="trang_thai" value={formData.trang_thai} onChange={handleChange} className={inputStyles} required>
                        {Object.values(RiskStatus).map(status => (
                            <option key={status} value={status}>{translate(status)}</option>
                        ))}
                    </select>
                </div>
            </div>
            <Modal.Footer>
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </Modal.Footer>
        </form>
    );
};

export default RiskForm;