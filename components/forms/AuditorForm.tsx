import React, { useState, useEffect } from 'react';
import type { DanhGiaVien, ToChucDanhGia } from '../../types';

interface AuditorFormProps {
    onSubmit: (data: Partial<DanhGiaVien>) => void;
    onCancel: () => void;
    initialData?: Partial<DanhGiaVien> | null;
    organizations: ToChucDanhGia[];
}

const AuditorForm: React.FC<AuditorFormProps> = ({ onSubmit, onCancel, initialData, organizations }) => {
    const getInitialState = () => ({
        ten: initialData?.ten || '',
        loai: initialData?.loai || 'internal',
        to_chuc_id: initialData?.to_chuc_id || '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        setFormData(getInitialState());
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // If type is changed to internal, clear the organization
            if (name === 'loai' && value === 'internal') {
                newState.to_chuc_id = '';
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...initialData, ...formData });
    };

    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 bg-white py-2.5 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-900";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ten" className={labelStyles}>Tên đánh giá viên</label>
                    <input
                        type="text"
                        name="ten"
                        id="ten"
                        className={inputStyles}
                        value={formData.ten}
                        onChange={handleChange}
                        required
                        placeholder="VD: Nguyễn Văn B"
                    />
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="loai" className={labelStyles}>Loại đánh giá viên</label>
                        <select
                            name="loai"
                            id="loai"
                            value={formData.loai}
                            onChange={handleChange}
                            className={inputStyles}
                        >
                            <option value="internal">Nội bộ</option>
                            <option value="external">Bên ngoài</option>
                        </select>
                    </div>
                    {formData.loai === 'external' && (
                        <div>
                            <label htmlFor="to_chuc_id" className={labelStyles}>Tổ chức</label>
                            <select
                                name="to_chuc_id"
                                id="to_chuc_id"
                                value={formData.to_chuc_id}
                                onChange={handleChange}
                                className={inputStyles}
                                required
                            >
                                <option value="">Chọn tổ chức</option>
                                {organizations.filter(o => o.is_active !== false).map(org => (
                                    <option key={org.id} value={org.id}>{org.ten}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Hủy</button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Lưu</button>
            </div>
        </form>
    );
};

export default AuditorForm;