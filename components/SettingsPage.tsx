import React from 'react';
import StatusCategoryView from './StatusCategoryView';

const SettingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Cài đặt Hệ thống</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
                Trang này hiển thị các danh mục trạng thái được định nghĩa sẵn trong hệ thống.
                Các trạng thái này không thể thay đổi từ giao diện người dùng để đảm bảo tính toàn vẹn của quy trình.
            </p>
            <StatusCategoryView />
        </div>
    );
};

export default SettingsPage;