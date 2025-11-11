import React from 'react';
import { DocumentStatus, VersionStatus, DistributionStatus, RiskStatus, ReviewResult } from '../../constants';
import { translate } from '../../utils/translations';

type BadgeStatus = DocumentStatus | VersionStatus | DistributionStatus | RiskStatus | ReviewResult | string;
type BadgeSize = 'sm' | 'md' | 'lg';

const statusColors: Record<BadgeStatus, string> = {
    // DocumentStatus
    [DocumentStatus.DA_BAN_HANH]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [DocumentStatus.CHO_PHE_DUYET]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [DocumentStatus.DANG_RA_SOAT]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    [DocumentStatus.HET_HIEU_LUC]: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
    [DocumentStatus.NHAP]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    // VersionStatus
    [VersionStatus.BAN_THAO]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    [VersionStatus.PHE_DUYET]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [VersionStatus.BAN_HANH]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [VersionStatus.THU_HOI]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // DistributionStatus
    [DistributionStatus.DANG_HIEU_LUC]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [DistributionStatus.MAT_HONG]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // ReviewResult
    [ReviewResult.TIEP_TUC]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [ReviewResult.CAN_SUA]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [ReviewResult.THU_HOI]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // RiskStatus
    [RiskStatus.MO]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [RiskStatus.DANG_LAM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [RiskStatus.DONG]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    // AuditAction
    create: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    delete: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // User Status
    'active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'inactive': 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
    // User Roles
    'admin': 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 font-semibold',
    'user': 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
};

const dotColors: Record<string, string> = {
    [DocumentStatus.DA_BAN_HANH]: 'fill-green-500',
    [DocumentStatus.CHO_PHE_DUYET]: 'fill-yellow-500',
    [DocumentStatus.DANG_RA_SOAT]: 'fill-teal-500',
    [DocumentStatus.HET_HIEU_LUC]: 'fill-zinc-500 dark:fill-zinc-400',
    [DocumentStatus.NHAP]: 'fill-purple-500',
    [VersionStatus.BAN_THAO]: 'fill-indigo-500',
    [VersionStatus.PHE_DUYET]: 'fill-yellow-500',
    [VersionStatus.BAN_HANH]: 'fill-green-500',
    [VersionStatus.THU_HOI]: 'fill-red-500',
    [DistributionStatus.DANG_HIEU_LUC]: 'fill-green-500',
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
    'active': 'fill-green-500',
    'inactive': 'fill-zinc-500 dark:fill-zinc-400',
    'admin': 'fill-sky-500',
    'user': 'fill-zinc-500 dark:fill-zinc-400',
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
    const colorClass = statusColors[status] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
    const dotColorClass = dotColors[status] || 'fill-zinc-400';
    const sizeClass = sizeClasses[size];
    
    return (
        <span title={title} className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${colorClass} badge-print`}>
            <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${dotColorClass}`} viewBox="0 0 6 6" aria-hidden="true">
                <circle cx={3} cy={3} r={3} />
            </svg>
            {translate(status)}
        </span>
    );
};

export default Badge;