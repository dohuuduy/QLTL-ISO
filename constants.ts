import type { ReportType } from './types';

export enum DocumentStatus {
    NHAP = 'nhap',
    DANG_RA_SOAT = 'dang_ra_soat',
    CHO_PHE_DUYET = 'cho_phe_duyet',
    DA_BAN_HANH = 'da_ban_hanh',
    HET_HIEU_LUC = 'het_hieu_luc',
}

export enum VersionStatus {
    BAN_THAO = 'ban_thao',
    PHE_DUYET = 'phe_duyet',
    BAN_HANH = 'ban_hahn',
    THU_HOI = 'thu_hoi',
}

export enum DistributionStatus {
    DANG_HIEU_LUC = 'dang_hieu_luc',
    THU_HOI = 'thu_hoi',
    MAT_HONG = 'mat_hong',
}

export enum ReviewResult {
    TIEP_TUC = 'tiep_tuc_hieu_luc',
    CAN_SUA = 'can_sua_doi_bo_sung',
    THU_HOI = 'thu_hoi_huy_bo',
}

export enum RiskStatus {
    MO = 'mo',
    DANG_LAM = 'dang_thuc_hien',
    DONG = 'dong',
}

export enum AuditAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN_SUCCESS = 'login_success',
    LOGIN_FAIL = 'login_fail',
    LOGOUT = 'logout',
}

export enum NotificationType {
    APPROVAL_PENDING = 'approval_pending',
    REVIEW_DUE = 'review_due',
    REVIEW_OVERDUE = 'review_overdue',
    EXPIRY_APPROACHING = 'expiry_approaching',
    DOCUMENT_EXPIRED = 'document_expired',
}

export enum AuditStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum DocumentRole {
    SOAN_THAO = 'soan_thao',
    RA_SOAT = 'ra_soat',
    PHE_DUYET = 'phe_duyet',
}


export const reportNavItems: { key: ReportType; title: string; icon: string; }[] = [
    { key: 'by-department', title: 'Theo Phòng ban', icon: 'building-library' },
    { key: 'by-standard', title: 'Theo Tiêu chuẩn', icon: 'bookmark' },
    { key: 'relationships', title: 'Quan hệ Tài liệu', icon: 'arrows-right-left' },
    { key: 'expiring', title: 'Tài liệu sắp hết hiệu lực', icon: 'clock' },
    { key: 'by-audit', title: 'Theo Audit', icon: 'calendar' },
];