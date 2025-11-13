import React from 'react';
import { DocumentStatus, VersionStatus, DistributionStatus, RiskStatus, ReviewResult, AuditStatus } from '../../constants';
import { translate } from '../../utils/translations';

type BadgeStatus = DocumentStatus | VersionStatus | DistributionStatus | RiskStatus | ReviewResult | AuditStatus | string;
type BadgeSize = 'sm' | 'md' | 'lg';

const statusColors: Record<BadgeStatus, string> = {
    // DocumentStatus
    [DocumentStatus.DA_BAN_HANH]: 'bg-green-100 text-green-800',
    [DocumentStatus.CHO_PHE_DUYET]: 'bg-yellow-100 text-yellow-800',
    [DocumentStatus.DANG_RA_SOAT]: 'bg-blue-100 text-blue-800',
    [DocumentStatus.HET_HIEU_LUC]: 'bg-gray-100 text-gray-800',
    [DocumentStatus.NHAP]: 'bg-purple-100 text-purple-800',
    // VersionStatus
    [VersionStatus.BAN_THAO]: 'bg-indigo-100 text-indigo-800',
    [VersionStatus.PHE_DUYET]: 'bg-yellow-100 text-yellow-800',
    [VersionStatus.BAN_HANH]: 'bg-green-100 text-green-800',
    [VersionStatus.THU_HOI]: 'bg-red-100 text-red-800',
    // DistributionStatus
    [DistributionStatus.DANG_HIEU_LUC]: 'bg-green-100 text-green-800',
    [DistributionStatus.MAT_HONG]: 'bg-red-100 text-red-800',
    // ReviewResult
    [ReviewResult.TIEP_TUC]: 'bg-green-100 text-green-800',
    [ReviewResult.CAN_SUA]: 'bg-yellow-100 text-yellow-800',
    [ReviewResult.THU_HOI]: 'bg-red-100 text-red-800',
    // RiskStatus
    [RiskStatus.MO]: 'bg-blue-100 text-blue-800',
    [RiskStatus.DANG_LAM]: 'bg-yellow-100 text-yellow-800',
    [RiskStatus.DONG]: 'bg-green-100 text-green-800',
    // AuditAction
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    // AuditStatus
    [AuditStatus.PLANNED]: 'bg-indigo-100 text-indigo-800',
    [AuditStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [AuditStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [AuditStatus.CANCELLED]: 'bg-red-100 text-red-800',
    // User Status
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    // User Roles
    'admin': 'bg-sky-100 text-sky-800 font-semibold',
    'user': 'bg-slate-100 text-slate-800',
};

const dotColors: Record<string, string> = {
    [DocumentStatus.DA_BAN_HANH]: 'fill-green-500',
    [DocumentStatus.CHO_PHE_DUYET]: 'fill-yellow-500',
    [DocumentStatus.DANG_RA_SOAT]: 'fill-blue-500',
    [DocumentStatus.HET_HIEU_LUC]: 'fill-gray-500',
    [DocumentStatus.NHAP]: 'fill-purple-500',
    [VersionStatus.BAN_THAO]: 'fill-indigo-500',
    [VersionStatus.PHE_DUYET]: 'fill-yellow-500',
    [VersionStatus.BAN_HANH]: 'fill-green-500',
    [VersionStatus.THU_HOI]: 'fill-red-500',
    [DistributionStatus.DANG_HIEU_LUC]: 'fill-green-500',
    // FIX: Removed duplicate key 'thu_hoi'. VersionStatus.THU_HOI provides the value for this key.
    [DistributionStatus.MAT_HONG]: 'fill-red-500',
    [ReviewResult.TIEP_TUC]: 'fill-green-500',
    [ReviewResult.CAN_SUA]: 'fill-yellow-500',
    [ReviewResult.THU_HOI]: 'fill-red-500',
    [RiskStatus.MO]: 'fill-blue-500',
    [RiskStatus.DANG_LAM]: 'fill-yellow-500',
    [RiskStatus.DONG]: 'fill-green-500',
    create: 'fill-green-500',
    update: 'fill-blue-500',
    delete: 'fill-red-500',
    [AuditStatus.PLANNED]: 'fill-indigo-500',
    [AuditStatus.IN_PROGRESS]: 'fill-blue-500',
    [AuditStatus.COMPLETED]: 'fill-green-500',
    [AuditStatus.CANCELLED]: 'fill-red-500',
    'active': 'fill-green-500',
    'inactive': 'fill-gray-500',
    'admin': 'fill-sky-500',
    'user': 'fill-slate-500',
};


const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
};

interface BadgeProps {
    status: BadgeStatus;
    size?: BadgeSize;
    title?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, size = 'md', title }) => {
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    const dotColorClass = dotColors[status] || 'fill-gray-400';
    const sizeClass = sizeClasses[size];
    
    return (
        <span title={title} className={`inline-flex items-center font-medium rounded-full whitespace-nowrap ${sizeClass} ${colorClass} badge-print`}>
            <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${dotColorClass}`} viewBox="0 0 6 6" aria-hidden="true">
                <circle cx={3} cy={3} r={3} />
            </svg>
            {translate(status)}
        </span>
    );
};

export default Badge;