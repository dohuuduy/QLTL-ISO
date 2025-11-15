import React, { useState, useEffect } from 'react';
import type { NhanSu, PhongBan, NhanSuRole, DanhMucChung } from '../../types';
import { Icon } from '../ui/Icon';
import { translate } from '../../utils/translations';
import { DocumentRole } from '../../constants';

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
        email: '',
        ten_dang_nhap: '',
        mat_khau: '123', // Default password for new users
        chuc_vu: '',
        phong_ban_id: '',
        role: 'user' as NhanSuRole,
        permissions: { canCreate: false, canUpdate: false, canDelete: false },
        nhiem_vu_tai_lieu: [] as DocumentRole[],
    });
    
    const [formData, setFormData] = useState(getInitialState());
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                ten: initialData.ten || '',
                email: initialData.email || '',
                ten_dang_nhap: initialData.ten_dang_nhap || '',
                mat_khau: '', // Leave empty for editing, user can fill to change it
                chuc_vu: initialData.chuc_vu || '',
                phong_ban_id: initialData.phong_ban_id || '',
                role: initialData.role || 'user',
                permissions: initialData.permissions || { canCreate: false, canUpdate: false, canDelete: false },
                nhiem_vu_tai_lieu: initialData.nhiem_vu_tai_lieu || [],
            });
        } else {
            // Reset form for new user, with default password
            setFormData(getInitialState());
        }
        setErrors({});
    }, [initialData]);

    const validate = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};
        if (!formData.ten.trim()) newErrors.ten = "Tên nhân sự là bắt buộc.";
        if (!formData.ten_dang_nhap.trim()) newErrors.ten_dang_nhap = "Tên đăng nhập là bắt buộc.";
        
        // Password is required only for new users
        if (!initialData?.id && !formData.mat_khau) {
             newErrors.mat_khau = "Mật khẩu là bắt buộc.";
        }
        
        // Email is optional, but if present, must be valid
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Định dạng email không hợp lệ.";
        }
        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
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
    
    const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        const role = name as DocumentRole;
        setFormData(prev => {
            const currentTasks = prev.nhiem_vu_tai_lieu || [];
            if (checked) {
                return { ...prev, nhiem_vu_tai_lieu: [...currentTasks, role] };
            } else {
                return { ...prev, nhiem_vu_tai_lieu: currentTasks.filter(t => t !== role) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const dataToSubmit: Partial<NhanSu> = { ...initialData, ...formData };
        
        // If password field is empty during an edit, don't update it
        if (initialData?.id && !formData.mat_khau) {
            delete dataToSubmit.mat_khau;
        }

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

    const isEditingSelf = initialData?.id === currentUser.id;
    
    const documentRoleOptions = [
        { id: DocumentRole.SOAN_THAO, label: translate(DocumentRole.SOAN_THAO) },
        { id: DocumentRole.RA_SOAT, label: translate(DocumentRole.RA_SOAT) },
        { id: DocumentRole.PHE_DUYET, label: translate(DocumentRole.PHE_DUYET) },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ten" className="form-label">Tên nhân sự <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="ten"
                        id="ten"
                        value={formData.ten}
                        onChange={handleChange}
                        className={`form-input ${errors.ten ? 'error' : ''}`}
                        required
                        placeholder="VD: Nguyễn Văn An"
                    />
                    {errors.ten && <p className="mt-1 text-sm text-red-600">{errors.ten}</p>}
                </div>
                 <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="VD: an.nv@company.com (tùy chọn)"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ten_dang_nhap" className="form-label">Tên đăng nhập <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="ten_dang_nhap"
                            id="ten_dang_nhap"
                            value={formData.ten_dang_nhap}
                            onChange={handleChange}
                            className={`form-input ${errors.ten_dang_nhap ? 'error' : ''}`}
                            required
                            placeholder="VD: an.nv"
                        />
                        {errors.ten_dang_nhap && <p className="mt-1 text-sm text-red-600">{errors.ten_dang_nhap}</p>}
                    </div>
                    <div>
                        <label htmlFor="mat_khau" className="form-label">Mật khẩu {!initialData && <span className="text-red-500">*</span>}</label>
                         <div className="relative">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                name="mat_khau"
                                id="mat_khau"
                                value={formData.mat_khau}
                                onChange={handleChange}
                                className={`form-input pr-10 ${errors.mat_khau ? 'error' : ''}`}
                                required={!initialData}
                                placeholder={initialData ? "Để trống nếu không đổi" : "Mật khẩu mặc định: 123"}
                            />
                             <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                <Icon type={isPasswordVisible ? 'eye-slash' : 'eye'} className="h-5 w-5" />
                            </button>
                        </div>
                         {errors.mat_khau && <p className="mt-1 text-sm text-red-600">{errors.mat_khau}</p>}
                    </div>
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="chuc_vu" className="form-label">Chức vụ <span className="text-red-500">*</span></label>
                        <select
                            name="chuc_vu"
                            id="chuc_vu"
                            value={formData.chuc_vu}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">Chọn chức vụ</option>
                            {activeOrCurrentlySelected(chucVuList, formData.chuc_vu).map(cv => (
                                <option key={cv.id} value={cv.id}>{cv.ten}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="phong_ban_id" className="form-label">Phòng ban <span className="text-red-500">*</span></label>
                        <select
                            name="phong_ban_id"
                            id="phong_ban_id"
                            value={formData.phong_ban_id}
                            onChange={handleChange}
                            className="form-select"
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
                        <label htmlFor="role" className="form-label">Vai trò <span className="text-red-500">*</span></label>
                        <select
                            name="role"
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-select disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                     <div className="space-y-4">
                        <fieldset className="border-t border-gray-200 pt-4">
                            <legend className="text-sm font-medium text-gray-900">Nhiệm vụ Tài liệu</legend>
                            <div className="mt-2 space-y-2">
                                {documentRoleOptions.map(option => (
                                    <div key={option.id} className="relative flex items-start">
                                        <div className="flex h-6 items-center">
                                            <input id={option.id} name={option.id} type="checkbox" checked={(formData.nhiem_vu_tai_lieu || []).includes(option.id)} onChange={handleTaskChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                        </div>
                                        <div className="ml-3 text-sm leading-6">
                                            <label htmlFor={option.id} className="font-medium text-gray-700">{option.label}</label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                         <fieldset>
                            <legend className="text-sm font-medium text-gray-900">Quyền hạn tài liệu</legend>
                            <div className="mt-2 space-y-2">
                                <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="canCreate" name="canCreate" type="checkbox" checked={formData.permissions.canCreate} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="canCreate" className="font-medium text-gray-700">Tạo tài liệu</label>
                                    </div>
                                </div>
                                 <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="canUpdate" name="canUpdate" type="checkbox" checked={formData.permissions.canUpdate} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="canUpdate" className="font-medium text-gray-700">Sửa tài liệu</label>
                                    </div>
                                </div>
                                <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="canDelete" name="canDelete" type="checkbox" checked={formData.permissions.canDelete} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="canDelete" className="font-medium text-gray-700">Xóa tài liệu</label>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
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

export default PersonnelForm;