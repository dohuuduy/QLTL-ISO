import React, { useState, useEffect } from 'react';
import type { DanhMucChung } from '../../types';
import Modal from '../ui/Modal';

interface GenericCategoryFormProps {
    onSubmit: (data: Partial<DanhMucChung>) => void;
    onCancel: () => void;
    initialData?: Partial<DanhMucChung> | null;
    categoryName: string;
}

const GenericCategoryForm: React.FC<GenericCategoryFormProps> = ({ onSubmit, onCancel, initialData, categoryName }) => {
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
    
    const inputStyles = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 py-2.5 px-3 text-gray-900 dark:text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-gray-400 dark:placeholder-slate-500";
    const labelStyles = "block text-sm font-medium text-gray-900 dark:text-slate-200";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <label htmlFor="ten" className={labelStyles}>
                    Tên {categoryName.toLowerCase()}
                </label>
                <input
                    type="text"
                    name="ten"
                    id="ten"
                    className={inputStyles}
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                    required
                    placeholder={`Nhập tên ${categoryName.toLowerCase()}`}
                />
            </div>
            <Modal.Footer>
                <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary ml-3">Lưu</button>
            </Modal.Footer>
        </form>
    );
};

export default GenericCategoryForm;