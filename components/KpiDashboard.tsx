import React, { useMemo } from 'react';
import type { DanhMucTaiLieu } from '../types';
import { DocumentStatus } from '../constants';
import { Icon } from './ui/Icon';

interface KpiDashboardProps {
    documents: DanhMucTaiLieu[];
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; iconBgColor: string }> = ({ title, value, icon, iconBgColor }) => (
    <div className="flex items-center p-4 sm:p-5 bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-md border border-zinc-200/50 dark:border-zinc-700/50">
        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${iconBgColor}`}>
            {icon}
        </div>
        <div className="ml-4 min-w-0">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 truncate">{title}</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
        </div>
    </div>
);


const KpiDashboard: React.FC<KpiDashboardProps> = ({ documents }) => {
    const kpiData = useMemo(() => {
        const total = documents.length;
        const active = documents.filter(d => d.trang_thai === DocumentStatus.DA_BAN_HANH).length;
        const inReview = documents.filter(d => d.trang_thai === DocumentStatus.DANG_RA_SOAT).length;
        const expired = documents.filter(d => d.trang_thai === DocumentStatus.HET_HIEU_LUC).length;

        return { total, active, inReview, expired };
    }, [documents]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <KpiCard 
                title="Tổng số Tài liệu" 
                value={kpiData.total} 
                icon={<Icon type="document-text" className="h-6 w-6 text-teal-600 dark:text-teal-400"/>} 
                iconBgColor="bg-teal-100 dark:bg-teal-900/50"
             />
             <KpiCard 
                title="Tài liệu Hiệu lực" 
                value={kpiData.active} 
                icon={<Icon type="check-circle" className="h-6 w-6 text-green-600 dark:text-green-400"/>} 
                iconBgColor="bg-green-100 dark:bg-green-900/50"
             />
             <KpiCard 
                title="Đang Rà soát" 
                value={kpiData.inReview} 
                icon={<Icon type="clock" className="h-6 w-6 text-yellow-600 dark:text-yellow-400"/>} 
                iconBgColor="bg-yellow-100 dark:bg-yellow-900/50"
             />
             <KpiCard 
                title="Hết hiệu lực" 
                value={kpiData.expired} 
                icon={<Icon type="archive" className="h-6 w-6 text-zinc-600 dark:text-zinc-400"/>} 
                iconBgColor="bg-zinc-100 dark:bg-zinc-700"
             />
        </div>
    );
};

export default KpiDashboard;