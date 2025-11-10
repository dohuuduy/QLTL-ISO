import React, { useState, useMemo } from 'react';
import type { AuditLog, NhanSu } from '../types';
import Card from './ui/Card';
import Table from './ui/Table';
import Badge from './ui/Badge';
import { formatDateTimeForDisplay } from '../utils/dateUtils';
import DatePicker from './ui/DatePicker';
import Pagination from './ui/Pagination';

interface AuditLogPageProps {
    auditLogs: AuditLog[];
    users: NhanSu[];
}

const ITEMS_PER_PAGE = 20;

const AuditLogPage: React.FC<AuditLogPageProps> = ({ auditLogs, users }) => {
    const [filters, setFilters] = useState({
        userId: '',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.ten])), [users]);

    const filteredLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            
            const matchesUser = filters.userId ? log.user_id === filters.userId : true;
            
            const matchesStartDate = filters.startDate 
                ? logDate >= new Date(filters.startDate) 
                : true;

            const matchesEndDate = filters.endDate 
                ? logDate <= new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)) 
                : true;

            return matchesUser && matchesStartDate && matchesEndDate;
        });
    }, [auditLogs, filters]);
    
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };
    
     const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ userId: '', startDate: '', endDate: '' });
        setCurrentPage(1);
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Nhật ký Hệ thống</h1>
            
            <Card>
                 <Card.Body>
                     <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Người dùng</label>
                            <select
                                id="userId"
                                name="userId"
                                value={filters.userId}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Tất cả người dùng</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.ten}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Từ ngày</label>
                            <DatePicker
                                id="start-date"
                                value={filters.startDate}
                                onChange={(value) => handleDateFilterChange('startDate', value)}
                                className="mt-1 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            />
                        </div>
                         <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Đến ngày</label>
                            <DatePicker
                                id="end-date"
                                value={filters.endDate}
                                onChange={(value) => handleDateFilterChange('endDate', value)}
                                className="mt-1 block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </Card.Body>
                <Table<AuditLog>
                    columns={[
                        { header: 'Thời gian', accessor: (item) => formatDateTimeForDisplay(item.timestamp) },
                        { header: 'Người dùng', accessor: 'user_name' },
                        { header: 'Hành động', accessor: (item) => <Badge status={item.action} /> },
                        { header: 'Chi tiết', accessor: 'details', className: 'whitespace-pre-wrap' },
                    ]}
                    data={paginatedLogs}
                />
                 {filteredLogs.length > 0 && (
                     <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    >
                         <p className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                            - <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}</span> 
                            {' '}trên <span className="font-medium">{filteredLogs.length}</span> kết quả
                        </p>
                    </Pagination>
                )}
            </Card>
        </div>
    );
};

export default AuditLogPage;