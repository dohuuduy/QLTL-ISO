import { DocumentStatus, VersionStatus, DistributionStatus, ReviewResult, RiskStatus, AuditAction, NotificationType, AuditStatus, DocumentRole } from './constants';

export type ReportType = 'by-department' | 'by-standard' | 'relationships' | 'expiring' | 'by-audit';

export type NhanSuRole = 'admin' | 'user';

export interface NhanSuPermissions {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export interface DanhMucChung {
    id: string;
    ten: string;
    is_active: boolean;
}

export interface PhongBan extends DanhMucChung {}
export interface ChucVu extends DanhMucChung {}
export interface LoaiTaiLieu extends DanhMucChung {}
export interface CapDoTaiLieu extends DanhMucChung {}
export interface MucDoBaoMat extends DanhMucChung {}
export interface TanSuatRaSoat extends DanhMucChung {
    so_thang?: number;
}
export interface HangMucThayDoi extends DanhMucChung {}
export interface ToChucDanhGia extends DanhMucChung {}

export interface DanhGiaVien extends DanhMucChung {
    loai: 'internal' | 'external';
    to_chuc_id?: string;
}


export interface NhanSu {
    id: string;
    ten: string;
    email: string;
    ten_dang_nhap: string;
    mat_khau: string;
    chuc_vu: string;
    phong_ban_id: string;
    role: NhanSuRole;
    is_active: boolean;
    permissions?: NhanSuPermissions;
    nhiem_vu_tai_lieu?: DocumentRole[];
}

export interface TieuChuan {
    id: string;
    ten: string;
    ten_viet_tat?: string;
    phien_ban?: string;
    ngay_ap_dung: string;
    ngay_ket_thuc_ap_dung?: string;
    mo_ta?: string;
    is_active: boolean;
}

export interface DanhMucTaiLieu {
    ma_tl: string;
    ten_tai_lieu: string;
    so_hieu: string;
    loai_tai_lieu: string;
    cap_do: string;
    pham_vi_ap_dung: string[];
    phong_ban_quan_ly: string;
    trang_thai: DocumentStatus;
    muc_do_bao_mat: string;
    tieu_chuan_ids: string[];
    iso_tham_chieu: string[];
    tieu_chuan_khac: string[];
    phap_ly_tham_chieu: string[];
    ngay_ban_hanh: string;
    ngay_hieu_luc: string;
    ngay_het_hieu_luc?: string;
    mo_ta_tom_tat: string;
    nguoi_soan_thao: string;
    nguoi_ra_soat: string;
    nguoi_phe_duyet: string;
    link_drive?: string;
    file_pdf?: string;
    file_docx?: string;
    ma_tl_cha?: string;
    tai_lieu_thay_the?: string;
    is_bookmarked?: boolean;
}

export interface PhienBanTaiLieu {
    id_phien_ban: string;
    ma_tl: string;
    phien_ban: string;
    ngay_phat_hanh: string;
    trang_thai_phien_ban: VersionStatus;
    tom_tat_thay_doi: string;
    noi_dung_cap_nhat: string;
    nguoi_thuc_hien: string;
    is_moi_nhat: boolean;
}

export interface LichRaSoat {
    id_lich: string;
    ma_tl: string;
    tan_suat: string;
    ngay_ra_soat_ke_tiep: string;
    nguoi_chiu_trach_nhiem: string;
    ngay_ra_soat_thuc_te?: string;
    ket_qua_ra_soat?: ReviewResult;
    ghi_chu?: string;
}

export interface NhatKyThayDoi {
    id_thay_doi: string;
    id_phien_ban: string;
    hang_muc: string;
    noi_dung_truoc: string;
    noi_dung_sau: string;
    ly_do_thay_doi: string;
    nguoi_de_xuat: string;
    ngay_de_xuat: string;
}

export interface PhanPhoiTaiLieu {
    id_phan_phoi: string;
    id_phien_ban: string;
    phong_ban_nhan: string;
    ngay_phan_phoi: string;
    so_luong_ban_cung: number;
    so_luong_ban_mem: number;
    trang_thai_phan_phoi: DistributionStatus;
    nguoi_nhan: string;
    ly_do_thu_hoi?: string;
    ngay_thu_hoi?: string;
}

export interface DaoTaoTruyenThong {
    id_dt: string;
    ma_tl: string;
    noi_dung_dao_tao: string;
    ngay_dao_tao: string;
    nguoi_dao_tao: string;
    phong_ban_tham_gia: string[];
    so_nguoi_tham_gia: number;
}

export interface RuiRoCoHoi {
    id_rr: string;
    ma_tl: string;
    loai: 'rui_ro' | 'co_hoi';
    mo_ta: string;
    muc_do_anh_huong: 'cao' | 'trung_binh' | 'thap';
    hanh_dong_phong_ngua: string;
    nguoi_phu_trach: string;
    ngay_nhan_dien: string;
    trang_thai: RiskStatus;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    user_id: string;
    user_name: string; // Add user_name for easier display
    action: AuditAction;
    entity_type: string; // e.g., 'documents', 'versions', 'system'
    entity_id?: string; // Optional ID of the entity affected
    ma_tl?: string; // Optional related document ID
    details: string;
}

export interface ThongBao {
    id: string;
    user_id: string;
    ma_tl: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    is_read: boolean;
}

export interface LichAudit {
    id: string;
    ten_cuoc_audit: string;
    loai_audit: 'internal' | 'external';
    to_chuc_danh_gia_id?: string;
    tieu_chuan_ids: string[];
    pham_vi: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    chuyen_gia_danh_gia_truong_id: string;
    doan_danh_gia_ids: string[];
    trang_thai: AuditStatus;
    ghi_chu?: string;
    tai_lieu_lien_quan_ids?: string[];
}