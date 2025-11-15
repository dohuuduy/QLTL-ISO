import { DocumentStatus, VersionStatus, DistributionStatus, ReviewResult, RiskStatus, AuditStatus, DocumentRole } from '../constants';
import type {
  DanhMucTaiLieu,
  PhienBanTaiLieu,
  LichRaSoat,
  NhanSu,
  PhongBan,
  LoaiTaiLieu,
  CapDoTaiLieu,
  MucDoBaoMat,
  TanSuatRaSoat,
  HangMucThayDoi,
  NhatKyThayDoi,
  PhanPhoiTaiLieu,
  DaoTaoTruyenThong,
  RuiRoCoHoi,
  AuditLog,
  ThongBao,
  ChucVu,
  TieuChuan,
  LichAudit,
  ToChucDanhGia,
  DanhGiaVien,
} from '../types';

// Categories
export const phongBan: PhongBan[] = [
  { id: 'pb1', ten: 'Phòng Kỹ thuật', is_active: true },
  { id: 'pb2', ten: 'Phòng Nhân sự', is_active: true },
  { id: 'pb3', ten: 'Phòng Kinh doanh', is_active: false },
  { id: 'pb4', ten: 'Ban Giám đốc', is_active: true },
];

export const chucVu: ChucVu[] = [
  { id: 'cv1', ten: 'Trưởng phòng', is_active: true },
  { id: 'cv2', ten: 'Chuyên viên', is_active: true },
  { id: 'cv3', ten: 'Kỹ sư', is_active: true },
  { id: 'cv4', ten: 'Nhân viên', is_active: false },
  { id: 'cv5', ten: 'Giám đốc', is_active: true },
];

export const nhanSu: NhanSu[] = [
  { id: 'ns_admin', ten: 'Quản trị', email: 'admin@company.com', ten_dang_nhap: 'admin', mat_khau: '123', chuc_vu: 'cv5', phong_ban_id: 'pb4', role: 'admin', is_active: true, nhiem_vu_tai_lieu: [DocumentRole.SOAN_THAO, DocumentRole.RA_SOAT, DocumentRole.PHE_DUYET] },
  { id: 'ns1', ten: 'Nguyễn Văn An', email: 'an.nv@company.com', ten_dang_nhap: 'an.nv', mat_khau: 'password123', chuc_vu: 'cv1', phong_ban_id: 'pb2', role: 'user', is_active: true, permissions: { canCreate: true, canUpdate: true, canDelete: false }, nhiem_vu_tai_lieu: [DocumentRole.RA_SOAT, DocumentRole.PHE_DUYET] },
  { id: 'ns2', ten: 'Trần Thị Bích', email: 'bich.tt@company.com', ten_dang_nhap: 'bich.tt', mat_khau: 'password123', chuc_vu: 'cv2', phong_ban_id: 'pb2', role: 'user', is_active: true, permissions: { canCreate: false, canUpdate: true, canDelete: false }, nhiem_vu_tai_lieu: [DocumentRole.SOAN_THAO] },
  { id: 'ns3', ten: 'Lê Minh Cường', email: 'cuong.lm@company.com', ten_dang_nhap: 'cuong.lm', mat_khau: 'password123', chuc_vu: 'cv1', phong_ban_id: 'pb1', role: 'user', is_active: true, permissions: { canCreate: false, canUpdate: false, canDelete: false }, nhiem_vu_tai_lieu: [DocumentRole.RA_SOAT, DocumentRole.PHE_DUYET] },
  { id: 'ns4', ten: 'Phạm Thị Dung', email: 'dung.pt@company.com', ten_dang_nhap: 'dung.pt', mat_khau: 'password123', chuc_vu: 'cv3', phong_ban_id: 'pb1', role: 'user', is_active: true, permissions: { canCreate: false, canUpdate: false, canDelete: false }, nhiem_vu_tai_lieu: [DocumentRole.SOAN_THAO] },
  { id: 'ns5', ten: 'Hoàng Văn Em', email: 'em.hv@company.com', ten_dang_nhap: 'em.hv', mat_khau: 'password123', chuc_vu: 'cv4', phong_ban_id: 'pb3', role: 'user', is_active: true, permissions: { canCreate: false, canUpdate: false, canDelete: false } },
];

export const loaiTaiLieu: LoaiTaiLieu[] = [
  { id: 'ltl1', ten: 'Quy trình', is_active: true },
  { id: 'ltl2', ten: 'Biểu mẫu', is_active: true },
  { id: 'ltl3', ten: 'Sổ tay', is_active: true },
  { id: 'ltl4', ten: 'Chính sách', is_active: false },
];

export const capDoTaiLieu: CapDoTaiLieu[] = [
  { id: 'cd1', ten: 'Cấp 1 - Sổ tay chất lượng', is_active: true },
  { id: 'cd2', ten: 'Cấp 2 - Quy trình', is_active: true },
  { id: 'cd3', ten: 'Cấp 3 - Hướng dẫn công việc', is_active: true },
  { id: 'cd4', ten: 'Cấp 4 - Biểu mẫu, hồ sơ', is_active: true },
];

export const mucDoBaoMat: MucDoBaoMat[] = [
  { id: 'bm1', ten: 'Công khai', is_active: true },
  { id: 'bm2', ten: 'Nội bộ', is_active: true },
  { id: 'bm3', ten: 'Mật', is_active: true },
];

export const tanSuatRaSoat: TanSuatRaSoat[] = [
    { id: 'ts4', ten: 'Hàng tháng', is_active: true, so_thang: 1 },
    { id: 'ts5', ten: 'Hàng quý (3 tháng)', is_active: true, so_thang: 3 },
    { id: 'ts1', ten: '6 tháng', is_active: true, so_thang: 6 },
    { id: 'ts2', ten: '12 tháng (Hàng năm)', is_active: true, so_thang: 12 },
    { id: 'ts3', ten: '24 tháng', is_active: false, so_thang: 24 },
];

export const hangMucThayDoi: HangMucThayDoi[] = [
    { id: 'hm1', ten: 'Cập nhật nội dung', is_active: true },
    { id: 'hm2', ten: 'Sửa lỗi chính tả', is_active: true },
    { id: 'hm3', ten: 'Thay đổi biểu mẫu', is_active: true },
];

export const toChucDanhGia: ToChucDanhGia[] = [
    { id: 'org1', ten: 'TÜV SÜD', is_active: true },
    { id: 'org2', ten: 'SGS Việt Nam', is_active: true },
    { id: 'org3', ten: 'BSI Group', is_active: true },
];

export const danhGiaVien: DanhGiaVien[] = [
    { id: 'dgv1', ten: 'Lê Minh Cường', loai: 'internal', is_active: true },
    { id: 'dgv2', ten: 'Nguyễn Văn An', loai: 'internal', is_active: true },
    { id: 'dgv3', ten: 'Phạm Thị Dung', loai: 'internal', is_active: true },
    { id: 'dgv4', ten: 'John Doe (TÜV)', loai: 'external', to_chuc_id: 'org1', is_active: true },
    { id: 'dgv5', ten: 'Jane Smith (SGS)', loai: 'external', to_chuc_id: 'org2', is_active: true },
];

export const tieuChuan: TieuChuan[] = [
    { 
        id: 'tc1', 
        ten: 'ISO 9001 - Hệ thống quản lý chất lượng',
        ten_viet_tat: 'QMS',
        phien_ban: '2015',
        ngay_ap_dung: '2015-09-23',
        mo_ta: 'Tiêu chuẩn quốc tế về hệ thống quản lý chất lượng, áp dụng cho mọi tổ chức.',
        is_active: true 
    },
    { 
        id: 'tc2', 
        ten: 'ISO 14001 - Hệ thống quản lý môi trường',
        ten_viet_tat: 'EMS',
        phien_ban: '2015',
        ngay_ap_dung: '2015-09-15',
        mo_ta: 'Tiêu chuẩn quốc tế về hệ thống quản lý môi trường, giúp tổ chức giảm tác động môi trường.',
        is_active: true 
    },
    { 
        id: 'tc3', 
        ten: 'ISO 45001 - Hệ thống quản lý an toàn và sức khỏe nghề nghiệp',
        ten_viet_tat: 'OH&S',
        phien_ban: '2018',
        ngay_ap_dung: '2018-03-12',
        mo_ta: 'Tiêu chuẩn quốc tế về an toàn và sức khỏe tại nơi làm việc.',
        is_active: true 
    },
    { 
        id: 'tc4', 
        ten: 'ISO 27001 - Hệ thống quản lý an ninh thông tin',
        ten_viet_tat: 'ISMS',
        phien_ban: '2013',
        ngay_ap_dung: '2013-09-25',
        ngay_ket_thuc_ap_dung: '2025-10-31',
        mo_ta: 'Tiêu chuẩn quốc tế về quản lý an ninh thông tin.',
        is_active: true 
    },
    { 
        id: 'tc5', 
        ten: 'ISO 22000 - Hệ thống quản lý an toàn thực phẩm',
        ten_viet_tat: 'FSMS',
        phien_ban: '2018',
        ngay_ap_dung: '2018-06-19',
        mo_ta: 'Tiêu chuẩn về hệ thống quản lý an toàn thực phẩm.',
        is_active: false 
    },
];


// Documents
export const documents: DanhMucTaiLieu[] = [
  {
    ma_tl: 'TL-001',
    ten_tai_lieu: 'Quy trình Tuyển dụng Nhân sự',
    so_hieu: 'QT-01-NS',
    loai_tai_lieu: 'ltl1',
    cap_do: 'cd2',
    pham_vi_ap_dung: ['Toàn công ty'],
    phong_ban_quan_ly: 'pb2',
    trang_thai: DocumentStatus.DA_BAN_HANH,
    muc_do_bao_mat: 'bm2',
    tieu_chuan_ids: ['tc1'],
    iso_tham_chieu: ['ISO 9001:2015'],
    tieu_chuan_khac: [],
    phap_ly_tham_chieu: ['Luật Lao động'],
    ngay_ban_hanh: '2023-01-15',
    ngay_hieu_luc: '2023-02-01',
    mo_ta_tom_tat: 'Quy trình này quy định các bước thực hiện tuyển dụng nhân sự cho công ty.',
    nguoi_soan_thao: 'ns2',
    nguoi_ra_soat: 'ns1',
    nguoi_phe_duyet: 'ns_admin',
    link_drive: 'https://docs.google.com/document/d/example1',
    file_pdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_docx: 'https://file-examples.com/storage/fe1236279963e10a22121e0/2017/02/file-sample_100kB.docx',
    is_bookmarked: true,
  },
  {
    ma_tl: 'TL-002',
    ten_tai_lieu: 'Sổ tay An toàn Lao động',
    so_hieu: 'ST-01-KT',
    loai_tai_lieu: 'ltl3',
    cap_do: 'cd1',
    pham_vi_ap_dung: ['Nhà máy', 'Công trường'],
    phong_ban_quan_ly: 'pb1',
    trang_thai: DocumentStatus.DANG_RA_SOAT,
    muc_do_bao_mat: 'bm1',
    tieu_chuan_ids: ['tc3'],
    iso_tham_chieu: ['ISO 45001:2018'],
    tieu_chuan_khac: [],
    phap_ly_tham_chieu: [],
    ngay_ban_hanh: '2022-06-10',
    ngay_hieu_luc: '2022-06-20',
    mo_ta_tom_tat: 'Sổ tay hướng dẫn các quy định về an toàn và vệ sinh lao động.',
    nguoi_soan_thao: 'ns4',
    nguoi_ra_soat: 'ns3',
    nguoi_phe_duyet: 'ns_admin',
  },
  {
    ma_tl: 'TL-003',
    ten_tai_lieu: 'Biểu mẫu Đề nghị Thanh toán',
    so_hieu: 'BM-01-KT',
    loai_tai_lieu: 'ltl2',
    cap_do: 'cd4',
    pham_vi_ap_dung: ['Toàn công ty'],
    phong_ban_quan_ly: 'pb3',
    trang_thai: DocumentStatus.CHO_PHE_DUYET,
    muc_do_bao_mat: 'bm2',
    tieu_chuan_ids: [],
    iso_tham_chieu: [],
    tieu_chuan_khac: [],
    phap_ly_tham_chieu: [],
    ngay_ban_hanh: '2023-11-01',
    ngay_hieu_luc: '2023-11-01',
    mo_ta_tom_tat: 'Biểu mẫu sử dụng cho việc đề nghị thanh toán các chi phí.',
    nguoi_soan_thao: 'ns5',
    nguoi_ra_soat: 'ns5',
    nguoi_phe_duyet: 'ns_admin',
  },
    {
    ma_tl: 'TL-004',
    ten_tai_lieu: 'Chính sách Bảo mật Thông tin',
    so_hieu: 'CS-01-GD',
    loai_tai_lieu: 'ltl4',
    cap_do: 'cd2',
    pham_vi_ap_dung: ['Toàn công ty'],
    phong_ban_quan_ly: 'pb4',
    trang_thai: DocumentStatus.DA_BAN_HANH,
    muc_do_bao_mat: 'bm3',
    tieu_chuan_ids: ['tc4'],
    iso_tham_chieu: ['ISO 27001:2013'],
    tieu_chuan_khac: [],
    phap_ly_tham_chieu: ['Luật An ninh mạng'],
    ngay_ban_hanh: '2021-05-20',
    ngay_hieu_luc: '2021-06-01',
    ngay_het_hieu_luc: '2024-05-31',
    mo_ta_tom_tat: 'Chính sách quy định về việc bảo vệ thông tin và tài sản thông tin của công ty.',
    nguoi_soan_thao: 'ns_admin',
    nguoi_ra_soat: 'ns_admin',
    nguoi_phe_duyet: 'ns_admin',
  },
  {
    ma_tl: 'TL-005',
    ten_tai_lieu: 'Quy trình Quản lý Khiếu nại Khách hàng',
    so_hieu: 'QT-02-KD',
    loai_tai_lieu: 'ltl1',
    cap_do: 'cd2',
    pham_vi_ap_dung: ['Phòng Kinh doanh'],
    phong_ban_quan_ly: 'pb3',
    trang_thai: DocumentStatus.NHAP,
    muc_do_bao_mat: 'bm2',
    tieu_chuan_ids: ['tc1'],
    iso_tham_chieu: ['ISO 9001:2015'],
    tieu_chuan_khac: [],
    phap_ly_tham_chieu: [],
    ngay_ban_hanh: '2024-03-01',
    ngay_hieu_luc: '2024-03-15',
    mo_ta_tom_tat: 'Quy trình tiếp nhận và xử lý các khiếu nại từ khách hàng.',
    nguoi_soan_thao: 'ns5',
    nguoi_ra_soat: 'ns5',
    nguoi_phe_duyet: 'ns_admin',
    ma_tl_cha: 'TL-001',
  },
  {
    ma_tl: 'TL-006',
    ten_tai_lieu: 'Quy định An toàn Thông tin',
    so_hieu: 'QD-01-IT',
    loai_tai_lieu: 'ltl1',
    cap_do: 'cd2',
    pham_vi_ap_dung: ['Toàn công ty'],
    phong_ban_quan_ly: 'pb1',
    trang_thai: DocumentStatus.DA_BAN_HANH,
    muc_do_bao_mat: 'bm3',
    tieu_chuan_ids: ['tc4'],
    iso_tham_chieu: ['ISO 27001:2013'],
    tieu_chuan_khac: [],
    phap_ly_tham_chieu: ['Luật An ninh mạng'],
    ngay_ban_hanh: '2022-05-15',
    ngay_hieu_luc: '2022-06-01',
    ngay_het_hieu_luc: '2024-06-01',
    mo_ta_tom_tat: 'Quy định chi tiết về các biện pháp đảm bảo an toàn thông tin cho hệ thống của công ty.',
    nguoi_soan_thao: 'ns3',
    nguoi_ra_soat: 'ns3',
    nguoi_phe_duyet: 'ns_admin',
  },
];

// Versions
export const versions: PhienBanTaiLieu[] = [
  { id_phien_ban: 'v1', ma_tl: 'TL-001', phien_ban: '1.0', ngay_phat_hanh: '2022-12-20', trang_thai_phien_ban: VersionStatus.BAN_HANH, tom_tat_thay_doi: 'Ban hành lần đầu', noi_dung_cap_nhat: 'Toàn bộ nội dung', nguoi_thuc_hien: 'ns2', is_moi_nhat: false },
  { id_phien_ban: 'v2', ma_tl: 'TL-001', phien_ban: '1.1', ngay_phat_hanh: '2023-01-15', trang_thai_phien_ban: VersionStatus.BAN_HANH, tom_tat_thay_doi: 'Cập nhật quy trình phỏng vấn', noi_dung_cap_nhat: 'Thay đổi mục 3.2 về các vòng phỏng vấn.', nguoi_thuc_hien: 'ns2', is_moi_nhat: true },
  { id_phien_ban: 'v3', ma_tl: 'TL-002', phien_ban: '1.0', ngay_phat_hanh: '2022-06-10', trang_thai_phien_ban: VersionStatus.BAN_HANH, tom_tat_thay_doi: 'Ban hành lần đầu', noi_dung_cap_nhat: 'Toàn bộ nội dung', nguoi_thuc_hien: 'ns4', is_moi_nhat: true },
];

export const changeLogs: NhatKyThayDoi[] = [
    { id_thay_doi: 'cl1', id_phien_ban: 'v2', hang_muc: 'hm1', noi_dung_truoc: 'Có 2 vòng phỏng vấn', noi_dung_sau: 'Có 3 vòng phỏng vấn: Sàng lọc, Chuyên môn, Văn hóa', ly_do_thay_doi: 'Tăng chất lượng ứng viên', nguoi_de_xuat: 'ns1', ngay_de_xuat: '2023-01-10' }
];

export const distributions: PhanPhoiTaiLieu[] = [
    { id_phan_phoi: 'pp1', id_phien_ban: 'v2', phong_ban_nhan: 'pb2', ngay_phan_phoi: '2023-02-01', so_luong_ban_cung: 2, so_luong_ban_mem: 1, trang_thai_phan_phoi: DistributionStatus.DANG_HIEU_LUC, nguoi_nhan: 'ns1' },
    { id_phan_phoi: 'pp2', id_phien_ban: 'v3', phong_ban_nhan: 'pb1', ngay_phan_phoi: '2022-06-20', so_luong_ban_cung: 5, so_luong_ban_mem: 1, trang_thai_phan_phoi: DistributionStatus.DANG_HIEU_LUC, nguoi_nhan: 'ns3' }
];

// Review Schedules
export const reviewSchedules: LichRaSoat[] = [
  { id_lich: 'rs1', ma_tl: 'TL-001', tan_suat: 'ts2', ngay_ra_soat_ke_tiep: '2024-02-01', nguoi_chiu_trach_nhiem: 'ns1', ngay_ra_soat_thuc_te: '2024-01-28', ket_qua_ra_soat: ReviewResult.TIEP_TUC },
  { id_lich: 'rs2', ma_tl: 'TL-002', tan_suat: 'ts2', ngay_ra_soat_ke_tiep: '2023-06-20', nguoi_chiu_trach_nhiem: 'ns3', ghi_chu: 'Đang tiến hành rà soát.' },
  { id_lich: 'rs3', ma_tl: 'TL-004', tan_suat: 'ts2', ngay_ra_soat_ke_tiep: '2022-06-01', nguoi_chiu_trach_nhiem: 'ns_admin', ngay_ra_soat_thuc_te: '2022-05-25', ket_qua_ra_soat: ReviewResult.CAN_SUA },
];

export const trainings: DaoTaoTruyenThong[] = [];
export const risks: RuiRoCoHoi[] = [];
export const auditTrail: AuditLog[] = [];
export const notifications: ThongBao[] = [];

// Audit Schedules
export const auditSchedules: LichAudit[] = [
    {
        id: 'audit-1',
        ten_cuoc_audit: 'Đánh giá nội bộ Q3/2024',
        loai_audit: 'internal',
        tieu_chuan_ids: ['tc1', 'tc3'],
        pham_vi: 'Toàn bộ các phòng ban trong công ty',
        ngay_bat_dau: '2024-09-15',
        ngay_ket_thuc: '2024-09-20',
        chuyen_gia_danh_gia_truong_id: 'dgv1',
        doan_danh_gia_ids: ['dgv2', 'dgv3'],
        trang_thai: AuditStatus.PLANNED,
        ghi_chu: 'Chuẩn bị các báo cáo của kỳ trước.',
        tai_lieu_lien_quan_ids: ['TL-004'],
    },
    {
        id: 'audit-2',
        ten_cuoc_audit: 'Đánh giá chứng nhận ISO 14001',
        loai_audit: 'external',
        to_chuc_danh_gia_id: 'org2',
        tieu_chuan_ids: ['tc2'],
        pham_vi: 'Nhà máy và các quy trình liên quan đến môi trường',
        ngay_bat_dau: '2024-07-20',
        ngay_ket_thuc: '2024-07-22',
        chuyen_gia_danh_gia_truong_id: 'dgv5',
        doan_danh_gia_ids: ['dgv1'],
        trang_thai: AuditStatus.IN_PROGRESS,
    },
     {
        id: 'audit-3',
        ten_cuoc_audit: 'Đánh giá đột xuất An toàn lao động',
        loai_audit: 'internal',
        tieu_chuan_ids: ['tc3'],
        pham_vi: 'Công trường A',
        ngay_bat_dau: '2024-05-10',
        ngay_ket_thuc: '2024-05-10',
        chuyen_gia_danh_gia_truong_id: 'dgv1',
        doan_danh_gia_ids: ['dgv3'],
        trang_thai: AuditStatus.COMPLETED,
        ghi_chu: 'Hoàn thành tốt, có vài điểm cần cải thiện.',
        tai_lieu_lien_quan_ids: ['TL-001'],
    },
];


export const mockData = {
    documents,
    versions,
    reviewSchedules,
    changeLogs,
    distributions,
    trainings,
    risks,
    auditTrail,
    notifications,
    auditSchedules,
    nhanSu,
    phongBan,
    chucVu,
    loaiTaiLieu,
    capDoTaiLieu,
    mucDoBaoMat,
    tanSuatRaSoat,
    hangMucThayDoi,
    tieuChuan,
    danhGiaVien,
    toChucDanhGia,
};