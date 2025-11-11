import React, { useState, useEffect } from 'react';
import type { PhanPhoiTaiLieu, PhienBanTaiLieu, NhanSu, PhongBan } from '../../types';
import { DistributionStatus } from '../../constants';
import { translate } from '../../utils/translations';
import DatePicker from '../ui/DatePicker';
import Modal from '../ui/Modal';

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

    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 py-2.5 px-3 text-gray-900 dark:text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-gray-400 dark:placeholder-slate-500";
    const labelStyles = "block text-sm font-medium text-gray-900 dark:text-slate-200";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="id_phien_ban" className={labelStyles}>Phiên bản</label>
                        <select name="id_phien_ban" id="id_phien_ban" value={formData.id_phien_ban} onChange={handleChange} className={inputStyles} required>
                            <option value="">Chọn phiên bản</option>
                            {versions.map(v => <option key={v.id_phien_ban} value={v.id_phien_ban}>{v.phien_ban}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ngay_phan_phoi" className={labelStyles}>Ngày phân phối</label>
                        <DatePicker id="ngay_phan_phoi" value={formData.ngay_phan_phoi} onChange={value => handleDateChange('ngay_phan_phoi', value)} required className={inputStyles} />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="phong_ban_nhan" className={labelStyles}>Phòng ban nhận</label>
                        <select name="phong_ban_nhan" id="phong_ban_nhan" value={formData.phong_ban_nhan} onChange={handleChange} className={inputStyles} required>
                            <option value="">Chọn phòng ban</option>
                            {activeOrCurrentlySelected(phongBanList, formData.phong_ban_nhan).map(pb => <option key={pb.id} value={pb.id}>{pb.ten}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="nguoi_nhan" className={labelStyles}>Người nhận</label>
                        <select name="nguoi_nhan" id="nguoi_nhan" value={formData.nguoi_nhan} onChange={handleChange} className={inputStyles} required>
                            <option value="">Chọn người</option>
                            {nhanSuList.filter(u => u.is_active !== false || u.id === formData.nguoi_nhan).map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="so_luong_ban_cung" className={labelStyles}>Số lượng bản cứng</label>
                        <input type="number" name="so_luong_ban_cung" id="so_luong_ban_cung" value={formData.so_luong_ban_cung} onChange={handleChange} className={inputStyles} min="0" />
                    </div>
                    <div>
                        <label htmlFor="so_luong_ban_mem" className={labelStyles}>Số lượng bản mềm</label>
                        <input type="number" name="so_luong_ban_mem" id="so_luong_ban_mem" value={formData.so_luong_ban_mem} onChange={handleChange} className={inputStyles} min="0" />
                    </div>
                </div>
                
                 <div>
                    <label htmlFor="trang_thai_phan_phoi" className={labelStyles}>Trạng thái</label>
                    <select name="trang_thai_phan_phoi" id="trang_thai_phan_phoi" value={formData.trang_thai_phan_phoi} onChange={handleChange} className={inputStyles} required>
                        {Object.values(DistributionStatus).map(status => (
                            <option key={status} value={status}>{translate(status)}</option>
                        ))}
                    </select>
                </div>
                
                {formData.trang_thai_phan_phoi === DistributionStatus.THU_HOI && (
                    <>
                        <div>
                            <label htmlFor="ngay_thu_hoi" className={labelStyles}>Ngày thu hồi</label>
                            <DatePicker id="ngay_thu_hoi" value={formData.ngay_thu_hoi} onChange={value => handleDateChange('ngay_thu_hoi', value)} className={inputStyles} />
                        </div>
                         <div>
                            <label htmlFor="ly_do_thu_hoi" className={labelStyles}>Lý do thu hồi</label>
                            <textarea name="ly_do_thu_hoi" id="ly_do_thu_hoi" value={formData.ly_do_thu_hoi} onChange={handleChange} rows={2} className={inputStyles} placeholder="Nhập lý do thu hồi..." />
                        </div>
                    </>
                )}
            </div>
            <Modal.Footer>
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </Modal.Footer>
        </form>
    );
};

export default DistributionForm;