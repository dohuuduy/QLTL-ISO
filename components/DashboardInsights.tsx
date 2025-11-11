import React, { useMemo } from 'react';
import type { DanhMucTaiLieu, PhongBan } from '../types';
import { DocumentStatus } from '../constants';
import Card from './ui/Card';
import { translate } from '../utils/translations';

interface DashboardInsightsProps {
    documents: DanhMucTaiLieu[];
    departments: PhongBan[];
}

const ChartBar: React.FC<{ label: string; value: number; maxValue: number; color: string }> = ({ label, value, maxValue, color }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center space-x-2">
            <div className="w-24 text-sm text-stone-600 dark:text-stone-400 truncate">{label}</div>
            <div className="flex-1 bg-stone-200 dark:bg-stone-700 rounded-full h-4">
                <div
                    className={`${color} h-4 rounded-full text-xs text-white flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                >
                    {value > 0 && percentage > 10 ? value : ''}
                </div>
            </div>
            <div className="w-8 text-sm font-medium text-stone-700 dark:text-stone-300">{value}</div>
        </div>
    );
};

const DashboardInsights: React.FC<DashboardInsightsProps> = ({ documents, departments }) => {
    const insights = useMemo(() => {
        const statusCounts: { [key in DocumentStatus]?: number } = {};
        const departmentCounts: { [key: string]: number } = {};

        for (const doc of documents) {
            statusCounts[doc.trang_thai] = (statusCounts[doc.trang_thai] || 0) + 1;
            departmentCounts[doc.phong_ban_quan_ly] = (departmentCounts[doc.phong_ban_quan_ly] || 0) + 1;
        }

        const departmentData = Object.entries(departmentCounts)
            .map(([id, count]) => ({
                id,
                name: departments.find(d => d.id === id)?.ten || 'Không xác định',
                count
            }))
            .sort((a, b) => b.count - a.count);

        return { statusCounts, departmentData };
    }, [documents, departments]);

    const maxDeptCount = Math.max(...insights.departmentData.map(d => d.count), 0);

    const statusColors: Record<DocumentStatus, string> = {
        [DocumentStatus.DA_BAN_HANH]: 'bg-emerald-500',
        [DocumentStatus.DANG_RA_SOAT]: 'bg-sky-500',
        [DocumentStatus.CHO_PHE_DUYET]: 'bg-amber-500',
        [DocumentStatus.NHAP]: 'bg-violet-500',
        [DocumentStatus.HET_HIEU_LUC]: 'bg-stone-500',
    };
    
    return (
        <Card>
            <Card.Body className="space-y-6">
                <div>
                    <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Phân bố Tài liệu theo Trạng thái</h3>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                        {Object.values(DocumentStatus).map((status) => (
                            <div key={status} className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                                <span className="text-sm text-stone-600 dark:text-stone-400">{translate(status)}: <strong className="text-stone-900 dark:text-stone-200">{insights.statusCounts[status] || 0}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                     <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Phân bố Tài liệu theo Phòng ban</h3>
                     <div className="mt-4 space-y-3">
                        {insights.departmentData.map(dept => (
                            <ChartBar
                                key={dept.id}
                                label={dept.name}
                                value={dept.count}
                                maxValue={maxDeptCount}
                                color="bg-rose-600"
                            />
                        ))}
                     </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default DashboardInsights;