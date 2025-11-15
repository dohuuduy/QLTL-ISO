import React, { useState, useEffect } from 'react';
import type { NhatKyThayDoi, PhienBanTaiLieu, NhanSu, DanhMucChung } from '../../types';
import DatePicker from '../ui/DatePicker';

interface ChangeLogFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: Partial<NhatKyThayDoi> | null;
    versions: PhienBanTaiLieu[];
    nhanSuList: NhanSu[];
    hangMucList: DanhMucChung[];
}

const ChangeLogForm: React.FC<ChangeLogFormProps> = ({ onSubmit, onCancel, initialData, versions, nhanSuList, hangMucList }) => {
    const [formData, setFormData] = useState({
        id_phien_ban: '',
        hang_muc: '',
        noi_dung_truoc: '',
        noi_dung_sau: '',
        ly_do_thay_doi: '',
        nguoi_de_xuat: '',
        ngay_de_xuat: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                id_phien_ban: initialData.id_phien_ban || '',
                hang_muc: initialData.hang_muc || '',
                noi_dung_truoc: initialData.noi_dung_truoc || '',
                noi_dung_sau: initialData.noi_dung_sau || '',
                ly_do_thay_doi: initialData.ly_do_thay_doi || '',
                nguoi_de_xuat: initialData.nguoi_de_xuat || '',
                ngay_de_xuat: initialData.ngay_de_xuat || new Date().toISOString().split('T')[0],
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
        onSubmit({ ...initialData, ...formData });
    };

    const activeOrCurrentlySelected = (list: any[], selectedId: string) => 
        list.filter(item => item.is_active !== false || item.id === selectedId);

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="id_phien_ban" className="form-label">Phiên bản <span className="text-red-500">*</span></label>
                        <select name="id_phien_ban" id="id_phien_ban" value={formData.id_phien_ban} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn phiên bản</option>
                            {versions.map(v => <option key={v.id_phien_ban} value={v.id_phien_ban}>{v.phien_ban}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="hang_muc" className="form-label">Hạng mục thay đổi <span className="text-red-500">*</span></label>
                        <select name="hang_muc" id="hang_muc" value={formData.hang_muc} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn hạng mục</option>
                            {activeOrCurrentlySelected(hangMucList, formData.hang_muc).map(hm => <option key={hm.id} value={hm.id}>{hm.ten}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="ly_do_thay_doi" className="form-label">Lý do thay đổi <span className="text-red-500">*</span></label>
                    <textarea name="ly_do_thay_doi" id="ly_do_thay_doi" value={formData.ly_do_thay_doi} onChange={handleChange} rows={2} className="form-textarea" required placeholder="Giải thích lý do cho sự thay đổi này" />
                </div>

                <div>
                    <label htmlFor="noi_dung_truoc" className="form-label">Nội dung trước</label>
                    <textarea name="noi_dung_truoc" id="noi_dung_truoc" value={formData.noi_dung_truoc} onChange={handleChange} rows={3} className="form-textarea" placeholder="Nội dung cũ" />
                </div>

                <div>
                    <label htmlFor="noi_dung_sau" className="form-label">Nội dung sau</label>
                    <textarea name="noi_dung_sau" id="noi_dung_sau" value={formData.noi_dung_sau} onChange={handleChange} rows={3} className="form-textarea" placeholder="Nội dung mới" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="nguoi_de_xuat" className="form-label">Người đề xuất <span className="text-red-500">*</span></label>
                        <select name="nguoi_de_xuat" id="nguoi_de_xuat" value={formData.nguoi_de_xuat} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn người</option>
                            {nhanSuList.filter(u => u.is_active !== false || u.id === formData.nguoi_de_xuat).map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ngay_de_xuat" className="form-label">Ngày đề xuất <span className="text-red-500">*</span></label>
                        <DatePicker id="ngay_de_xuat" value={formData.ngay_de_xuat} onChange={value => handleDateChange('ngay_de_xuat', value)} required />
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </div>
        </form>
    );
};

export default ChangeLogForm;