import React, { useState, useEffect } from 'react';
import type { NhanSu, PhongBan, NhanSuRole, DanhMucChung } from '../../types';
import { Icon } from '../ui/Icon';
import { translate } from '../../utils/translations';
import Modal from '../ui/Modal';

interface PersonnelFormProps {
    onSubmit: (data: Partial<NhanSu>) => void;
    onCancel: () => void;
    initialData?: Partial<NhanSu> | null;
    phongBanList: PhongBan[];
    chucVuList: DanhMucChung[];
    currentUser: NhanSu;
}

const PersonnelForm: React.FC<PersonnelFormProps> = ({ onSubmit, onCancel, initialData, phongBanList, chucVuList, currentUser }) => {
    const getInitialState = () => ({
        ten: '',
        ten_dang_nhap: '',
        mat_khau: initialData ? '' : '123',
        chuc_vu: '',
        phong_ban_id: '',
        role: 'user' as NhanSuRole,
        permissions: { canCreate: false, canUpdate: false, canDelete: false }
    });
    
    const [formData, setFormData] = useState(getInitialState());
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ten: initialData.ten || '',
                ten_dang_nhap: initialData.ten_dang_nhap || '',
                mat_khau: initialData.mat_khau || '',
                chuc_vu: initialData.chuc_vu || '',
                phong_ban_id: initialData.phong_ban_id || '',
                role: initialData.role || 'user',
                permissions: initialData.permissions || { canCreate: false, canUpdate: false, canDelete: false }
            });
        } else {
            // Reset form for new user, with default password
            setFormData(getInitialState());
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [name]: checked
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit: Partial<NhanSu> = { ...initialData, ...formData };
        if (formData.role !== 'admin') {
             dataToSubmit.permissions = formData.permissions;
        } else {
            delete dataToSubmit.permissions; // Admins don't need explicit permissions
        }
        onSubmit(dataToSubmit);
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const activeOrCurrentlySelected = (list: any[], selectedId: string) => 
        list.filter(item => item.is_active !== false || item.id === selectedId);

    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 py-2.5 px-3 text-gray-900 dark:text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-gray-400 dark:placeholder-slate-500";
    const labelStyles = "block text-sm font-medium text-gray-900 dark:text-slate-200";
    
    const isEditingSelf = initialData?.id === currentUser.id;

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ten" className={labelStyles}>Tên nhân sự</label>
                    <input
                        type="text"
                        name="ten"
                        id="ten"
                        value={formData.ten}
                        onChange={handleChange}
                        className={inputStyles}
                        required
                        placeholder="VD: Nguyễn Văn An"
                    />
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ten_dang_nhap" className={labelStyles}>Tên đăng nhập</label>
                        <input
                            type="text"
                            name="ten_dang_nhap"
                            id="ten_dang_nhap"
                            value={formData.ten_dang_nhap}
                            onChange={handleChange}
                            className={inputStyles}
                            required
                            placeholder="VD: an.nv"
                        />
                    </div>
                    <div>
                        <label htmlFor="mat_khau" className={labelStyles}>Mật khẩu</label>
                         <div className="relative mt-1">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                name="mat_khau"
                                id="mat_khau"
                                value={formData.mat_khau}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 py-2.5 px-3 pr-10 text-gray-900 dark:text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-gray-400 dark:placeholder-slate-500"
                                required
                                placeholder="Nhập mật khẩu"
                            />
                             <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300"
                                aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                <Icon type={isPasswordVisible ? 'eye-slash' : 'eye'} className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="chuc_vu" className={labelStyles}>Chức vụ</label>
                        <select
                            name="chuc_vu"
                            id="chuc_vu"
                            value={formData.chuc_vu}
                            onChange={handleChange}
                            className={inputStyles}
                            required
                        >
                            <option value="">Chọn chức vụ</option>
                            {activeOrCurrentlySelected(chucVuList, formData.chuc_vu).map(cv => (
                                <option key={cv.id} value={cv.id}>{cv.ten}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="phong_ban_id" className={labelStyles}>Phòng ban</label>
                        <select
                            name="phong_ban_id"
                            id="phong_ban_id"
                            value={formData.phong_ban_id}
                            onChange={handleChange}
                            className={inputStyles}
                            required
                        >
                            <option value="">Chọn phòng ban</option>
                            {activeOrCurrentlySelected(phongBanList, formData.phong_ban_id).map(pb => (
                                <option key={pb.id} value={pb.id}>{pb.ten}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {currentUser.role === 'admin' && (
                     <div>
                        <label htmlFor="role" className={labelStyles}>Vai trò</label>
                        <select
                            name="role"
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={`${inputStyles} disabled:bg-gray-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed`}
                            required
                            disabled={isEditingSelf}
                            title={isEditingSelf ? "Không thể thay đổi vai trò của chính mình." : ""}
                        >
                            <option value="user">{translate('user')}</option>
                            <option value="admin">{translate('admin')}</option>
                        </select>
                    </div>
                )}
                
                {currentUser.role === 'admin' && formData.role === 'user' && !isEditingSelf && (
                     <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                         <fieldset>
                            <legend className="text-sm font-medium text-gray-900 dark:text-slate-200">Quyền hạn tài liệu</legend>
                            <div className="mt-2 space-y-2">
                                <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="canCreate" name="canCreate" type="checkbox" checked={formData.permissions.canCreate} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="canCreate" className="font-medium text-gray-700 dark:text-slate-300">Tạo tài liệu</label>
                                    </div>
                                </div>
                                 <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="canUpdate" name="canUpdate" type="checkbox" checked={formData.permissions.canUpdate} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="canUpdate" className="font-medium text-gray-700 dark:text-slate-300">Sửa tài liệu</label>
                                    </div>
                                </div>
                                <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="canDelete" name="canDelete" type="checkbox" checked={formData.permissions.canDelete} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="canDelete" className="font-medium text-gray-700 dark:text-slate-300">Xóa tài liệu</label>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                )}

            </div>
            <Modal.Footer>
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </Modal.Footer>
        </form>
    );
};

export default PersonnelForm;