import React, { useMemo } from 'react';
import type { LichAudit } from '../types';
import { AuditStatus } from '../constants';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { Icon } from './ui/Icon';
import { formatDateForDisplay } from '../utils/dateUtils';

interface UpcomingAuditsProps {
    schedules: LichAudit[];
    nhanSuMap: Map<string, string>;
    onNavigate: () => void;
}

const UpcomingAudits: React.FC<UpcomingAuditsProps> = ({ schedules, nhanSuMap, onNavigate }) => {
    const upcomingSchedules = useMemo(() => {
        return schedules
            .filter(schedule => 
                schedule.trang_thai === AuditStatus.PLANNED || 
                schedule.trang_thai === AuditStatus.IN_PROGRESS
            )
            .sort((a, b) => new Date(a.ngay_bat_dau).getTime() - new Date(b.ngay_bat_dau).getTime())
            .slice(0, 5); // Show top 5 upcoming/ongoing
    }, [schedules]);

    if (upcomingSchedules.length === 0) {
        return (
            <Card>
                <Card.Header>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Lịch Audit Sắp tới</h3>
                </Card.Header>
                <Card.Body>
                    <div className="text-center py-6">
                        <Icon type="calendar" className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Không có cuộc audit nào sắp diễn ra.</p>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Lịch Audit Sắp tới</h3>
                <button
                    onClick={onNavigate}
                    className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
                >
                    Xem tất cả
                </button>
            </Card.Header>
            <Card.Body className="p-0">
                <ul role="list" className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {upcomingSchedules.map(audit => (
                        <li key={audit.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate pr-2">{audit.ten_cuoc_audit}</p>
                                <Badge status={audit.trang_thai} size="sm" />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                <div>
                                    <p>Bắt đầu: {formatDateForDisplay(audit.ngay_bat_dau)}</p>
                                    <p>Trưởng đoàn: {nhanSuMap.get(audit.chuyen_gia_danh_gia_truong_id) || 'N/A'}</p>
                                </div>
                                <span className="font-medium capitalize">{audit.loai_audit === 'internal' ? 'Nội bộ' : 'Bên ngoài'}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card.Body>
        </Card>
    );
};

export default UpcomingAudits;