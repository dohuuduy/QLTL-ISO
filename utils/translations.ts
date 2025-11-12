import { 
    DocumentStatus, 
    VersionStatus,
    DistributionStatus,
    ReviewResult,
    RiskStatus,
    AuditAction,
    AuditStatus
} from '../constants';

export const translations: Record<string, string> = {
    // DocumentStatus
    [DocumentStatus.NHAP]: "Bản nháp",
    [DocumentStatus.DANG_RA_SOAT]: "Đang rà soát",
    [DocumentStatus.CHO_PHE_DUYET]: "Chờ phê duyệt",
    [DocumentStatus.DA_BAN_HANH]: "Đã ban hành",
    [DocumentStatus.HET_HIEU_LUC]: "Hết hiệu lực",

    // VersionStatus
    [VersionStatus.BAN_THAO]: "Bản thảo",
    [VersionStatus.PHE_DUYET]: "Phê duyệt",
    [VersionStatus.BAN_HANH]: "Ban hành",
    // FIX: Removed duplicate key 'thu_hoi'. `DistributionStatus.THU_HOI` also uses this key. The translation from DistributionStatus ("Đã thu hồi") will be used for both.
    // [VersionStatus.THU_HOI]: "Thu hồi",

    // DistributionStatus
    [DistributionStatus.DANG_HIEU_LUC]: "Đang hiệu lực",
    [DistributionStatus.THU_HOI]: "Đã thu hồi",
    [DistributionStatus.MAT_HONG]: "Mất/Hỏng",
    
    // ReviewResult
    [ReviewResult.TIEP_TUC]: "Tiếp tục",
    [ReviewResult.CAN_SUA]: "Cần sửa",
    [ReviewResult.THU_HOI]: "Thu hồi",

    // RiskStatus
    [RiskStatus.MO]: "Mở",
    [RiskStatus.DANG_LAM]: "Đang thực hiện",
    [RiskStatus.DONG]: "Đóng",

    // AuditAction
    [AuditAction.CREATE]: "Tạo mới",
    [AuditAction.UPDATE]: "Cập nhật",
    [AuditAction.DELETE]: "Xóa",
    [AuditAction.LOGIN_SUCCESS]: "Đăng nhập thành công",
    [AuditAction.LOGIN_FAIL]: "Đăng nhập thất bại",
    [AuditAction.LOGOUT]: "Đăng xuất",
    
    // AuditStatus
    [AuditStatus.PLANNED]: "Đã lên lịch",
    [AuditStatus.IN_PROGRESS]: "Đang tiến hành",
    [AuditStatus.COMPLETED]: "Hoàn thành",
    [AuditStatus.CANCELLED]: "Đã hủy",

    // Entity Types for Audit Log & Categories
    'documents': "Tài liệu",
    'versions': "Phiên bản",
    'changeLogs': "Nhật ký thay đổi",
    'distributions': "Phân phối",
    'reviewSchedules': "Lịch rà soát",
    'trainings': "Đào tạo",
    'risks': "Rủi ro & cơ hội",
    'auditSchedules': "Lịch audit",
    'nhanSu': 'Nhân sự',
    'phongBan': 'Phòng ban',
    'chucVu': 'Chức vụ',
    'loaiTaiLieu': 'Loại tài liệu',
    'capDoTaiLieu': 'Cấp độ tài liệu',
    'mucDoBaoMat': 'Mức độ bảo mật',
    'tanSuatRaSoat': 'Tần suất rà soát',
    'hangMucThayDoi': 'Hạng mục thay đổi',
    'tieuChuan': 'Tiêu chuẩn',
    'danhGiaVien': 'Đánh giá viên',
    'toChucDanhGia': 'Tổ chức đánh giá',
    'system': 'Hệ thống',

    // User Status
    'active': "Đang hoạt động",
    'inactive': "Vô hiệu hóa",

    // User Roles
    'admin': "Quản trị viên",
    'user': "Người dùng",

    // Relationship types
    'parent': 'Tài liệu cha',
    'self': 'Tài liệu gốc',
    'child': 'Tài liệu con',
};

export const translate = (key: string): string => {
    return translations[key] || key;
};