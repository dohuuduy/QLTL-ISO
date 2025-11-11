import React, { useMemo } from 'react';
import type { DanhMucTaiLieu } from '../types';
import { DocumentStatus } from '../constants';
import { Icon } from './ui/Icon';

interface KpiDashboardProps {
    documents: DanhMucTaiLieu[];
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; iconBgColor: string }> = ({ title, value, icon, iconBgColor }) => (
    <div className="flex items-center p-6 bg-white rounded-xl shadow border border-slate-200">
        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${iconBgColor}`}>
            {icon}
        </div>
        <div className="ml-5 min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
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
                icon={<Icon type="document-text" className="h-6 w-6 text-blue-600"/>} 
                iconBgColor="bg-blue-100"
             />
             <KpiCard 
                title="Tài liệu Hiệu lực" 
                value={kpiData.active} 
                icon={<Icon type="check-circle" className="h-6 w-6 text-green-600"/>} 
                iconBgColor="bg-green-100"
             />
             <KpiCard 
                title="Đang Rà soát" 
                value={kpiData.inReview} 
                icon={<Icon type="clock" className="h-6 w-6 text-yellow-600"/>} 
                iconBgColor="bg-yellow-100"
             />
             <KpiCard 
                title="Hết hiệu lực" 
                value={kpiData.expired} 
                icon={<Icon type="archive" className="h-6 w-6 text-gray-600"/>} 
                iconBgColor="bg-gray-100"
             />
        </div>
    );
};

export default KpiDashboard;