import React from 'react';
import StatusCategoryView from './StatusCategoryView';

const SettingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
            <p className="text-gray-600">
                Trang này hiển thị các danh mục trạng thái được định nghĩa sẵn trong hệ thống.
                Các trạng thái này không thể thay đổi từ giao diện người dùng để đảm bảo tính toàn vẹn của quy trình.
            </p>
            <StatusCategoryView />
        </div>
    );
};

export default SettingsPage;
