import React, { useState, useEffect } from 'react';
import type { PhanPhoiTaiLieu, PhienBanTaiLieu, NhanSu, PhongBan } from '../../types';
import { DistributionStatus } from '../../constants';
import { translate } from '../../utils/translations';
import DatePicker from '../ui/DatePicker';

interface DistributionFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: Partial<PhanPhoiTaiLieu> | null;
    versions: PhienBanTaiLieu[];
    phongBanList: PhongBan[];
    nhanSuList: NhanSu[];
}

const DistributionForm: React.FC<DistributionFormProps> = ({ onSubmit, onCancel, initialData, versions, phongBanList, nhanSuList }) => {
    const [formData, setFormData] = useState({
        id_phien_ban: '',
        phong_ban_nhan: '',
        nguoi_nhan: '',
        ngay_phan_phoi: new Date().toISOString().split('T')[0],
        so_luong_ban_cung: 0,
        so_luong_ban_mem: 1,
        trang_thai_phan_phoi: DistributionStatus.DANG_HIEU_LUC,
        ly_do_thu_hoi: '',
        ngay_thu_hoi: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                id_phien_ban: initialData.id_phien_ban || '',
                phong_ban_nhan: initialData.phong_ban_nhan || '',
                nguoi_nhan: initialData.nguoi_nhan || '',
                ngay_phan_phoi: initialData.ngay_phan_phoi || new Date().toISOString().split('T')[0],
                so_luong_ban_cung: initialData.so_luong_ban_cung || 0,
                so_luong_ban_mem: initialData.so_luong_ban_mem || 1,
                trang_thai_phan_phoi: initialData.trang_thai_phan_phoi || DistributionStatus.DANG_HIEU_LUC,
                ly_do_thu_hoi: initialData.ly_do_thu_hoi || '',
                ngay_thu_hoi: initialData.ngay_thu_hoi || '',
            });
        }
    }, [initialData]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const finalValue = (e.target as HTMLInputElement).type === 'number' ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleDateChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submittedData = { 
            ...initialData, 
            ...formData,
            ngay_thu_hoi: formData.ngay_thu_hoi || undefined,
            ly_do_thu_hoi: formData.ly_do_thu_hoi || undefined,
        };
        onSubmit(submittedData);
    };

    const activeOrCurrentlySelected = (list: any[], selectedId: string) => 
        list.filter(item => item.is_active !== false || item.id === selectedId);

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="id_phien_ban" className="form-label">Phiên bản</label>
                        <select name="id_phien_ban" id="id_phien_ban" value={formData.id_phien_ban} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn phiên bản</option>
                            {versions.map(v => <option key={v.id_phien_ban} value={v.id_phien_ban}>{v.phien_ban}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ngay_phan_phoi" className="form-label">Ngày phân phối</label>
                        <DatePicker id="ngay_phan_phoi" value={formData.ngay_phan_phoi} onChange={value => handleDateChange('ngay_phan_phoi', value)} required />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="phong_ban_nhan" className="form-label">Phòng ban nhận</label>
                        <select name="phong_ban_nhan" id="phong_ban_nhan" value={formData.phong_ban_nhan} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn phòng ban</option>
                            {activeOrCurrentlySelected(phongBanList, formData.phong_ban_nhan).map(pb => <option key={pb.id} value={pb.id}>{pb.ten}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="nguoi_nhan" className="form-label">Người nhận</label>
                        <select name="nguoi_nhan" id="nguoi_nhan" value={formData.nguoi_nhan} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn người</option>
                            {nhanSuList.filter(u => u.is_active !== false || u.id === formData.nguoi_nhan).map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="so_luong_ban_cung" className="form-label">Số lượng bản cứng</label>
                        <input type="number" name="so_luong_ban_cung" id="so_luong_ban_cung" value={formData.so_luong_ban_cung} onChange={handleChange} className="form-input" min="0" />
                    </div>
                    <div>
                        <label htmlFor="so_luong_ban_mem" className="form-label">Số lượng bản mềm</label>
                        <input type="number" name="so_luong_ban_mem" id="so_luong_ban_mem" value={formData.so_luong_ban_mem} onChange={handleChange} className="form-input" min="0" />
                    </div>
                </div>
                
                 <div>
                    <label htmlFor="trang_thai_phan_phoi" className="form-label">Trạng thái</label>
                    <select name="trang_thai_phan_phoi" id="trang_thai_phan_phoi" value={formData.trang_thai_phan_phoi} onChange={handleChange} className="form-select" required>
                        {Object.values(DistributionStatus).map(status => (
                            <option key={status} value={status}>{translate(status)}</option>
                        ))}
                    </select>
                </div>
                
                {formData.trang_thai_phan_phoi === DistributionStatus.THU_HOI && (
                    <>
                        <div>
                            <label htmlFor="ngay_thu_hoi" className="form-label">Ngày thu hồi</label>
                            <DatePicker id="ngay_thu_hoi" value={formData.ngay_thu_hoi} onChange={value => handleDateChange('ngay_thu_hoi', value)} />
                        </div>
                         <div>
                            <label htmlFor="ly_do_thu_hoi" className="form-label">Lý do thu hồi</label>
                            <textarea name="ly_do_thu_hoi" id="ly_do_thu_hoi" value={formData.ly_do_thu_hoi} onChange={handleChange} rows={2} className="form-textarea" placeholder="Nhập lý do thu hồi..." />
                        </div>
                    </>
                )}
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </div>
        </form>
    );
};

export default DistributionForm;