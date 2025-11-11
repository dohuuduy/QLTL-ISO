import React, { useState, useEffect } from 'react';
import type { PhongBan } from '../../types';

interface DepartmentFormProps {
    onSubmit: (data: Partial<PhongBan>) => void;
    onCancel: () => void;
    initialData?: Partial<PhongBan> | null;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ onSubmit, onCancel, initialData }) => {
    const [ten, setTen] = useState('');

    useEffect(() => {
        if (initialData) {
            setTen(initialData.ten || '');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...initialData, ten });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <label htmlFor="ten" className="form-label">
                    Tên phòng ban
                </label>
                <input
                    type="text"
                    name="ten"
                    id="ten"
                    className="form-input"
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                    required
                    placeholder="VD: Phòng Kỹ thuật"
                />
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </div>
        </form>
    );
};

export default DepartmentForm;