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

    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 bg-white py-2.5 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400";
    const labelStyles = "block text-sm font-medium text-gray-700";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <label htmlFor="ten" className={labelStyles}>
                    Tên phòng ban
                </label>
                <input
                    type="text"
                    name="ten"
                    id="ten"
                    className={inputStyles}
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                    required
                    placeholder="VD: Phòng Kỹ thuật"
                />
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
                <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Hủy</button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Lưu</button>
            </div>
        </form>
    );
};

export default DepartmentForm;