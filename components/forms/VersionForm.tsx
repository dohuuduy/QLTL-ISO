import React, { useState, useEffect } from 'react';
import type { PhienBanTaiLieu, NhanSu } from '../../types';
import { VersionStatus } from '../../constants';
import { translate } from '../../utils/translations';
import DatePicker from '../ui/DatePicker';

interface VersionFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: Partial<PhienBanTaiLieu> | null;
    ma_tl: string;
    nhanSuList: NhanSu[];
}

const VersionForm: React.FC<VersionFormProps> = ({ onSubmit, onCancel, initialData, ma_tl, nhanSuList }) => {
    const getInitialState = (data?: Partial<PhienBanTaiLieu> | null) => ({
        phien_ban: data?.phien_ban || '',
        ngay_phat_hanh: data?.ngay_phat_hanh || new Date().toISOString().split('T')[0],
        trang_thai_phien_ban: data?.trang_thai_phien_ban || VersionStatus.BAN_THAO,
        tom_tat_thay_doi: data?.tom_tat_thay_doi || '',
        noi_dung_cap_nhat: data?.noi_dung_cap_nhat || '',
        nguoi_thuc_hien: data?.nguoi_thuc_hien || '',
        is_moi_nhat: data ? (data.is_moi_nhat || false) : true, // Default to true for new versions
    });

    const [formData, setFormData] = useState(getInitialState(initialData));

    useEffect(() => {
        setFormData(getInitialState(initialData));
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDateChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...initialData, ...formData, ma_tl });
    };
    
    const activeOrCurrentlySelectedUsers = nhanSuList.filter(u => u.is_active !== false || u.id === formData.nguoi_thuc_hien);

    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 bg-white py-2.5 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="phien_ban" className={labelStyles}>Số phiên bản</label>
                        <input type="text" name="phien_ban" id="phien_ban" value={formData.phien_ban} onChange={handleChange} className={inputStyles} required placeholder="VD: 1.0, 1.1, 2.0..." />
                    </div>
                    <div>
                        <label htmlFor="ngay_phat_hanh" className={labelStyles}>Ngày phát hành</label>
                        <DatePicker id="ngay_phat_hanh" value={formData.ngay_phat_hanh} onChange={value => handleDateChange('ngay_phat_hanh', value)} required className={inputStyles} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="trang_thai_phien_ban" className={labelStyles}>Trạng thái</label>
                        <select name="trang_thai_phien_ban" id="trang_thai_phien_ban" value={formData.trang_thai_phien_ban} onChange={handleChange} className={inputStyles} required>
                            {Object.values(VersionStatus).map(status => (
                                <option key={status} value={status}>{translate(status)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="nguoi_thuc_hien" className={labelStyles}>Người thực hiện</label>
                        <select name="nguoi_thuc_hien" id="nguoi_thuc_hien" value={formData.nguoi_thuc_hien} onChange={handleChange} className={inputStyles} required>
                            <option value="">Chọn người</option>
                            {activeOrCurrentlySelectedUsers.map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="tom_tat_thay_doi" className={labelStyles}>Tóm tắt thay đổi</label>
                    <textarea name="tom_tat_thay_doi" id="tom_tat_thay_doi" value={formData.tom_tat_thay_doi} onChange={handleChange} rows={2} className={inputStyles} required placeholder="Tóm tắt ngắn gọn những thay đổi trong phiên bản này" />
                </div>

                <div>
                    <label htmlFor="noi_dung_cap_nhat" className={labelStyles}>Nội dung cập nhật (chi tiết)</label>
                    <textarea name="noi_dung_cap_nhat" id="noi_dung_cap_nhat" value={formData.noi_dung_cap_nhat} onChange={handleChange} rows={4} className={inputStyles} placeholder="Mô tả chi tiết những nội dung đã được cập nhật" />
                </div>
                
                 <div className="relative flex items-start pt-2">
                    <div className="flex h-6 items-center">
                        <input
                            id="is_moi_nhat"
                            name="is_moi_nhat"
                            type="checkbox"
                            checked={formData.is_moi_nhat}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="is_moi_nhat" className="font-medium text-gray-900">
                            Đặt làm phiên bản mới nhất
                        </label>
                         <p className="text-gray-500">Các phiên bản cũ của tài liệu này sẽ tự động được chuyển sang trạng thái "Thu hồi".</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Hủy</button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Lưu</button>
            </div>
        </form>
    );
};

export default VersionForm;