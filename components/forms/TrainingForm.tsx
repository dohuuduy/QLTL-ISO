import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { DaoTaoTruyenThong, NhanSu, PhongBan } from '../../types';
import DatePicker from '../ui/DatePicker';
import { Icon } from '../ui/Icon';

interface TrainingFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: Partial<DaoTaoTruyenThong> | null;
    ma_tl: string;
    nhanSuList: NhanSu[];
    phongBanList: PhongBan[];
}

const TrainingForm: React.FC<TrainingFormProps> = ({ onSubmit, onCancel, initialData, ma_tl, nhanSuList, phongBanList }) => {
    const getInitialState = () => ({
        noi_dung_dao_tao: initialData?.noi_dung_dao_tao || '',
        ngay_dao_tao: initialData?.ngay_dao_tao || new Date().toISOString().split('T')[0],
        nguoi_dao_tao: initialData?.nguoi_dao_tao || '',
        phong_ban_tham_gia: initialData?.phong_ban_tham_gia || [],
        so_nguoi_tham_gia: initialData?.so_nguoi_tham_gia || 0,
    });

    const [formData, setFormData] = useState(getInitialState());
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
    const deptDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFormData(getInitialState());
    }, [initialData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
                setIsDeptDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [deptDropdownRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const finalValue = (e.target as HTMLInputElement).type === 'number' ? parseInt(value, 10) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleDateChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectDept = (deptId: string) => {
        setFormData(prev => ({
            ...prev,
            phong_ban_tham_gia: [...(prev.phong_ban_tham_gia || []), deptId]
        }));
    };

    const handleRemoveDept = (deptId: string) => {
        setFormData(prev => ({
            ...prev,
            phong_ban_tham_gia: (prev.phong_ban_tham_gia || []).filter(id => id !== deptId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...initialData, ...formData, ma_tl });
    };
    
    const availableDepartments = useMemo(() => {
        return phongBanList
            .filter(pb => 
                (pb.is_active !== false) && 
                !formData.phong_ban_tham_gia?.includes(pb.id)
            )
            .sort((a, b) => a.ten.localeCompare(b.ten));
    }, [phongBanList, formData.phong_ban_tham_gia]);
    
    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 bg-white py-2.5 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="noi_dung_dao_tao" className={labelStyles}>Nội dung đào tạo</label>
                    <textarea name="noi_dung_dao_tao" id="noi_dung_dao_tao" value={formData.noi_dung_dao_tao} onChange={handleChange} rows={3} className={inputStyles} required placeholder="Mô tả nội dung buổi đào tạo, truyền thông..." />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ngay_dao_tao" className={labelStyles}>Ngày đào tạo</label>
                        <DatePicker id="ngay_dao_tao" value={formData.ngay_dao_tao} onChange={value => handleDateChange('ngay_dao_tao', value)} required className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="nguoi_dao_tao" className={labelStyles}>Người đào tạo</label>
                        <select name="nguoi_dao_tao" id="nguoi_dao_tao" value={formData.nguoi_dao_tao} onChange={handleChange} className={inputStyles} required>
                            <option value="">Chọn người</option>
                            {nhanSuList.filter(u => u.is_active !== false || u.id === formData.nguoi_dao_tao).map(ns => <option key={ns.id} value={ns.id}>{ns.ten}</option>)}
                        </select>
                    </div>
                </div>
                
                <div ref={deptDropdownRef} className="relative">
                    <label className={labelStyles}>Phòng ban tham gia</label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDeptDropdownOpen(prev => !prev)}
                            className={`${inputStyles} border-gray-300 flex items-center justify-between text-left`}
                        >
                            <div className="flex flex-wrap gap-2 items-center min-h-[22px]">
                                {(formData.phong_ban_tham_gia || []).length > 0 ? (
                                    (formData.phong_ban_tham_gia || []).map(id => {
                                        const dept = phongBanList.find(pb => pb.id === id);
                                        return (
                                            <span key={id} className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                {dept?.ten || id}
                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveDept(id); }} className="h-3.5 w-3.5 rounded-full text-blue-600 hover:bg-blue-200">
                                                    <Icon type="x-mark" className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="text-gray-400">Chọn phòng ban...</span>
                                )}
                            </div>
                            <Icon type="chevron-down" className="h-5 w-5 text-gray-400" />
                        </button>
                        {isDeptDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                                <ul>
                                    {availableDepartments.length > 0 ? (
                                        availableDepartments.map(pb => (
                                            <li key={pb.id} onClick={() => handleSelectDept(pb.id)} className="px-3 py-2 text-sm text-gray-800 hover:bg-slate-100 cursor-pointer">
                                                {pb.ten}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-sm text-gray-500">Không có phòng ban nào.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="so_nguoi_tham_gia" className={labelStyles}>Số người tham gia</label>
                    <input type="number" name="so_nguoi_tham_gia" id="so_nguoi_tham_gia" value={formData.so_nguoi_tham_gia} onChange={handleChange} className={inputStyles} min="0" />
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Hủy</button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Lưu</button>
            </div>
        </form>
    );
};

export default TrainingForm;
