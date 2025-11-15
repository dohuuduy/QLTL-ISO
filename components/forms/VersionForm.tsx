import React, { useState, useEffect, useMemo } from 'react';
import type { PhienBanTaiLieu, NhanSu } from '../../types';
import { VersionStatus, DocumentRole } from '../../constants';
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
    
    const implementerOptions = useMemo(() => {
        const activeUsers = nhanSuList.filter(u => u.is_active !== false);
        const suggestedUsers = activeUsers.filter(u => u.nhiem_vu_tai_lieu?.includes(DocumentRole.SOAN_THAO));
        
        if (suggestedUsers.length === 0) {
            return activeUsers.map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>);
        }

        const otherUsers = activeUsers.filter(u => !u.nhiem_vu_tai_lieu?.includes(DocumentRole.SOAN_THAO));

        return (
            <>
                <optgroup label="Gợi ý (Người soạn thảo)">
                    {suggestedUsers.map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                </optgroup>
                {otherUsers.length > 0 && (
                    <optgroup label="Tất cả nhân viên">
                        {otherUsers.map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                    </optgroup>
                )}
            </>
        );
    }, [nhanSuList]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="phien_ban" className="form-label">Số phiên bản <span className="text-red-500">*</span></label>
                        <input type="text" name="phien_ban" id="phien_ban" value={formData.phien_ban} onChange={handleChange} className="form-input" required placeholder="VD: 1.0, 1.1, 2.0..." />
                    </div>
                    <div>
                        <label htmlFor="ngay_phat_hanh" className="form-label">Ngày phát hành <span className="text-red-500">*</span></label>
                        <DatePicker id="ngay_phat_hanh" value={formData.ngay_phat_hanh} onChange={value => handleDateChange('ngay_phat_hanh', value)} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="trang_thai_phien_ban" className="form-label">Trạng thái <span className="text-red-500">*</span></label>
                        <select name="trang_thai_phien_ban" id="trang_thai_phien_ban" value={formData.trang_thai_phien_ban} onChange={handleChange} className="form-select" required>
                            {Object.values(VersionStatus).map(status => (
                                <option key={status} value={status}>{translate(status)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="nguoi_thuc_hien" className="form-label">Người thực hiện <span className="text-red-500">*</span></label>
                        <select name="nguoi_thuc_hien" id="nguoi_thuc_hien" value={formData.nguoi_thuc_hien} onChange={handleChange} className="form-select" required>
                            <option value="">Chọn người</option>
                            {implementerOptions}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="tom_tat_thay_doi" className="form-label">Tóm tắt thay đổi <span className="text-red-500">*</span></label>
                    <textarea name="tom_tat_thay_doi" id="tom_tat_thay_doi" value={formData.tom_tat_thay_doi} onChange={handleChange} rows={2} className="form-textarea" required placeholder="Tóm tắt ngắn gọn những thay đổi trong phiên bản này" />
                </div>

                <div>
                    <label htmlFor="noi_dung_cap_nhat" className="form-label">Nội dung cập nhật (chi tiết)</label>
                    <textarea name="noi_dung_cap_nhat" id="noi_dung_cap_nhat" value={formData.noi_dung_cap_nhat} onChange={handleChange} rows={4} className="form-textarea" placeholder="Mô tả chi tiết những nội dung đã được cập nhật" />
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
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </div>
        </form>
    );
};

export default VersionForm;