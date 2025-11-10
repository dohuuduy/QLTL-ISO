import React from 'react';
import { DocumentStatus, VersionStatus, DistributionStatus, RiskStatus, ReviewResult } from '../../constants';
import { translate } from '../../utils/translations';

type BadgeStatus = DocumentStatus | VersionStatus | DistributionStatus | RiskStatus | ReviewResult | string;
type BadgeSize = 'sm' | 'md' | 'lg';

// FIX: Added missing status colors for ReviewResult and the updated DistributionStatus.THU_HOI
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
    // FIX: Removed duplicate key. `VersionStatus.THU_HOI` and `DistributionStatus.THU_HOI` have the same value 'thu_hoi'.
    // [DistributionStatus.THU_HOI]: 'bg-red-100 text-red-800',
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
    // User Status
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    // User Roles
    'admin': 'bg-sky-100 text-sky-800 font-semibold',
    'user': 'bg-slate-100 text-slate-800',
};

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
};

interface BadgeProps {
    status: BadgeStatus;
    size?: BadgeSize;
}

const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    const sizeClass = sizeClasses[size];
    
    return (
        <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${colorClass} badge-print`}>
            {translate(status)}
        </span>
    );
};

export default Badge;