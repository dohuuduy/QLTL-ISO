import React, { useState, useMemo, useEffect } from 'react';
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

const AuditLogPage: React.FC<AuditLogPageProps> = ({ auditLogs, users }) => {
    const [filters, setFilters] = useState({
        userId: '',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, itemsPerPage]);

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
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLogs, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
     const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ userId: '', startDate: '', endDate: '' });
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Nhật ký Hệ thống</h1>
            
            <Card>
                 <Card.Body>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="userId" className="form-label">Người dùng</label>
                            <select
                                id="userId"
                                name="userId"
                                value={filters.userId}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">Tất cả người dùng</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.ten}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="start-date" className="form-label">Từ ngày</label>
                            <DatePicker
                                id="start-date"
                                value={filters.startDate}
                                onChange={(value) => handleDateFilterChange('startDate', value)}
                            />
                        </div>
                         <div>
                            <label htmlFor="end-date" className="form-label">Đến ngày</label>
                            <DatePicker
                                id="end-date"
                                value={filters.endDate}
                                onChange={(value) => handleDateFilterChange('endDate', value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="btn-secondary"
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
                         <div className="flex items-center gap-x-4">
                            <p className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                - <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> 
                                {' '}trên <span className="font-medium">{filteredLogs.length}</span> kết quả
                            </p>
                            <div className="flex items-center gap-2">
                                <label htmlFor="items-per-page" className="text-sm text-gray-700">Hiển thị:</label>
                                <select
                                    id="items-per-page"
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="form-select py-1 w-auto"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-700">dòng/trang</span>
                            </div>
                        </div>
                    </Pagination>
                )}
            </Card>
        </div>
    );
};

export default AuditLogPage;
