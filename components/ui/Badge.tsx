import React from 'react';
import { DocumentStatus, VersionStatus, DistributionStatus, RiskStatus, ReviewResult } from '../../constants';
import { translate } from '../../utils/translations';

type BadgeStatus = DocumentStatus | VersionStatus | DistributionStatus | RiskStatus | ReviewResult | string;
type BadgeSize = 'sm' | 'md' | 'lg';

const statusColors: Record<BadgeStatus, string> = {
    // DocumentStatus
    [DocumentStatus.DA_BAN_HANH]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    [DocumentStatus.CHO_PHE_DUYET]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    [DocumentStatus.DANG_RA_SOAT]: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    [DocumentStatus.HET_HIEU_LUC]: 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300',
    [DocumentStatus.NHAP]: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
    // VersionStatus
    [VersionStatus.BAN_THAO]: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
    [VersionStatus.PHE_DUYET]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    [VersionStatus.BAN_HANH]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    [VersionStatus.THU_HOI]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // DistributionStatus
    [DistributionStatus.DANG_HIEU_LUC]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    [DistributionStatus.MAT_HONG]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // ReviewResult
    [ReviewResult.TIEP_TUC]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    [ReviewResult.CAN_SUA]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    [ReviewResult.THU_HOI]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // RiskStatus
    [RiskStatus.MO]: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    [RiskStatus.DANG_LAM]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    [RiskStatus.DONG]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    // AuditAction
    create: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    update: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    delete: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    // User Status
    'active': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    'inactive': 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300',
    // User Roles
    'admin': 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 font-semibold',
    'user': 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300',
};

const dotColors: Record<string, string> = {
    [DocumentStatus.DA_BAN_HANH]: 'fill-emerald-500',
    [DocumentStatus.CHO_PHE_DUYET]: 'fill-amber-500',
    [DocumentStatus.DANG_RA_SOAT]: 'fill-sky-500',
    [DocumentStatus.HET_HIEU_LUC]: 'fill-stone-500 dark:fill-stone-400',
    [DocumentStatus.NHAP]: 'fill-violet-500',
    [VersionStatus.BAN_THAO]: 'fill-violet-500',
    [VersionStatus.PHE_DUYET]: 'fill-amber-500',
    [VersionStatus.BAN_HANH]: 'fill-emerald-500',
    [VersionStatus.THU_HOI]: 'fill-red-500',
    [DistributionStatus.DANG_HIEU_LUC]: 'fill-emerald-500',
    [DistributionStatus.MAT_HONG]: 'fill-red-500',
    [ReviewResult.TIEP_TUC]: 'fill-emerald-500',
    [ReviewResult.CAN_SUA]: 'fill-amber-500',
    [ReviewResult.THU_HOI]: 'fill-red-500',
    [RiskStatus.MO]: 'fill-sky-500',
    [RiskStatus.DANG_LAM]: 'fill-amber-500',
    [RiskStatus.DONG]: 'fill-emerald-500',
    create: 'fill-emerald-500',
    update: 'fill-sky-500',
    delete: 'fill-red-500',
    'active': 'fill-emerald-500',
    'inactive': 'fill-stone-500 dark:fill-stone-400',
    'admin': 'fill-rose-500',
    'user': 'fill-stone-500 dark:fill-stone-400',
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
    const colorClass = statusColors[status] || 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300';
    const dotColorClass = dotColors[status] || 'fill-stone-400';
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