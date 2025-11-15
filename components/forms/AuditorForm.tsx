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

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ten" className="form-label">Tên đánh giá viên <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="ten"
                        id="ten"
                        className="form-input"
                        value={formData.ten}
                        onChange={handleChange}
                        required
                        placeholder="VD: Nguyễn Văn B"
                    />
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="loai" className="form-label">Loại đánh giá viên</label>
                        <select
                            name="loai"
                            id="loai"
                            value={formData.loai}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="internal">Nội bộ</option>
                            <option value="external">Bên ngoài</option>
                        </select>
                    </div>
                    {formData.loai === 'external' && (
                        <div>
                            <label htmlFor="to_chuc_id" className="form-label">Tổ chức <span className="text-red-500">*</span></label>
                            <select
                                name="to_chuc_id"
                                id="to_chuc_id"
                                value={formData.to_chuc_id}
                                onChange={handleChange}
                                className="form-select"
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
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </div>
        </form>
    );
};

export default AuditorForm;