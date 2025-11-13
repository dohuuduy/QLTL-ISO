import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Import Types
import type { 
    NhanSu,
    DanhMucTaiLieu,
    ReportType,
    DanhMucChung,
    LichRaSoat,
    ThongBao,
    PhienBanTaiLieu
} from './types';
import { VersionStatus, DocumentStatus, NotificationType } from './constants';

// Import Services & Data
import { login, getAllData, updateAllData, sendEmail } from './services/api';
import { mockData } from './data/mockData';

// Import Components
import Layout from './components/layout/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DocumentManagementPage from './components/DocumentManagementPage';
import DocumentDetail from './components/DocumentDetail';
import AuditManagementPage from './components/AuditManagementPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import AuditLogPage from './components/AuditLogPage';
import GroupedCategoryPage from './components/GroupedCategoryPage';
import DashboardSkeleton from './components/DashboardSkeleton';

// Import Utils
import { formatDateForDisplay as formatDateInGMT7 } from './utils/dateUtils';

type AppData = typeof mockData;

// Define an initial empty state for the application data
const initialAppData: AppData = {
    documents: [],
    versions: [],
    reviewSchedules: [],
    changeLogs: [],
    distributions: [],
    trainings: [],
    risks: [],
    auditTrail: [],
    notifications: [],
    auditSchedules: [],
    nhanSu: [],
    phongBan: [],
    chucVu: [],
    loaiTaiLieu: [],
    capDoTaiLieu: [],
    mucDoBaoMat: [],
    tanSuatRaSoat: [],
    hangMucThayDoi: [],
    tieuChuan: [],
    danhGiaVien: [],
    toChucDanhGia: [],
};


// Define View states
type View =
    | { type: 'dashboard' }
    | { type: 'documents'; filter: string | null }
    | { type: 'documentDetail'; docId: string }
    | { type: 'audits' }
    | { type: 'reports'; reportType: ReportType | null }
    | { type: 'reports-detailed' }
    | { type: 'report-by-employee' }
    | { type: 'audit-log' }
    | { type: 'settings' }
    | { type: 'settings-group-org' }
    | { type: 'settings-group-doc' }
    | { type: 'settings-group-audit' };


/**
 * Creates a professional HTML email body.
 * @param title The main headline of the email.
 * @param doc The document object.
 * @param mainMessage The primary message body.
 * @param details An object containing key-value pairs of details to display.
 * @param ctaText Text for the call-to-action button.
 * @param ctaLink URL for the call-to-action button.
 * @returns A string containing the full HTML for the email.
 */
const createProfessionalEmailBody = (
    title: string,
    doc: DanhMucTaiLieu,
    mainMessage: string,
    details: Record<string, string>,
    ctaText: string,
    ctaLink: string
): string => {
    const detailRows = Object.entries(details)
        .map(([key, value]) => `
            <tr>
                <td style="padding: 4px 0; font-weight: 600; color: #4b5563; width: 150px;">${key}:</td>
                <td style="padding: 4px 0; color: #111827;">${value}</td>
            </tr>
        `).join('');

    const pdfButton = doc.file_pdf && doc.file_pdf.trim() !== ''
        ? `
            <a href="${doc.file_pdf.trim()}" target="_blank" style="display: inline-block; margin-top: 15px; margin-right: 10px; padding: 10px 18px; font-size: 14px; font-weight: 500; color: #1e40af; background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; text-decoration: none;">
                Tải file PDF
            </a>
        `
        : '';

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr>
                    <td style="padding: 24px; text-align: center; background-color: #1d4ed8; color: #ffffff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1 style="margin: 0; font-size: 24px;">Hệ thống Quản lý Tài liệu ISO</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 32px;">
                        <h2 style="margin-top: 0; font-size: 20px; color: #111827;">${title}</h2>
                        <p>${mainMessage}</p>
                        <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 6px;">
                            <h3 style="margin-top: 0; font-size: 16px; color: #111827;">Thông tin chi tiết:</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                ${detailRows}
                            </table>
                        </div>
                        
                        ${pdfButton}
                        <a href="${ctaLink}" target="_blank" style="display: inline-block; margin-top: 15px; padding: 10px 18px; font-size: 14px; font-weight: 500; color: #ffffff; background-color: #2563eb; border-radius: 6px; text-decoration: none;">
                            ${ctaText}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">Đây là email tự động từ Hệ thống Quản lý Tài liệu ISO. Vui lòng không trả lời.</p>
                    </td>
                </tr>
            </table>
        </div>
    `;
};

// ++ DATE HELPERS ++
// Chuyển 'YYYY-MM-DD' -> Date local (midnight local time)
const parseYMDToLocalDate = (ymd?: string): Date | undefined => {
    if (!ymd) return undefined;
    const parts = ymd.split('-');
    if (parts.length < 3) return undefined;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return undefined;
    return new Date(y, m - 1, d); // local midnight
};

// Chuyển Date local -> 'YYYY-MM-DD'
const formatDateToYMD = (date?: Date | null): string | undefined => {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/**
 * Normalizes a date string to 'YYYY-MM-DD' format representing the date in local timezone.
 * If the string is a full ISO timestamp (with time and timezone), it will convert the timestamp
 * to the date in local timezone and return YYYY-MM-DD. If it's already 'YYYY-MM-DD' it returns unchanged.
 */
const normalizeDateString = (dateString?: string): string | undefined => {
    if (!dateString) return undefined;
    // Full ISO timestamp check (has 'T' and time part)
    const isFullISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString);
    if (isFullISO) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString.split('T')[0];
            }
            // Convert to local date and format
            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return formatDateToYMD(localDate);
        } catch (e) {
            console.error(`Error normalizing date string "${dateString}":`, e);
            return dateString.split('T')[0];
        }
    }
    // If already YYYY-MM-DD or other, take date part
    return dateString.split('T')[0];
};


/**
 * Iterates through the entire application data and normalizes all date fields
 * to ensure a consistent 'YYYY-MM-DD' format.
 * @param data The raw application data.
 * @returns The application data with all date fields normalized.
 */
const normalizeDataDates = (data: AppData): AppData => {
    return {
        ...data,
        documents: data.documents.map(doc => ({
            ...doc,
            ngay_ban_hanh: normalizeDateString(doc.ngay_ban_hanh)!,
            ngay_hieu_luc: normalizeDateString(doc.ngay_hieu_luc)!,
            ngay_het_hieu_luc: normalizeDateString(doc.ngay_het_hieu_luc),
        })),
        versions: data.versions.map(ver => ({
            ...ver,
            ngay_phat_hanh: normalizeDateString(ver.ngay_phat_hanh)!,
        })),
        reviewSchedules: data.reviewSchedules.map(rs => ({
            ...rs,
            ngay_ra_soat_ke_tiep: normalizeDateString(rs.ngay_ra_soat_ke_tiep)!,
            ngay_ra_soat_thuc_te: normalizeDateString(rs.ngay_ra_soat_thuc_te),
        })),
        changeLogs: data.changeLogs.map(cl => ({
            ...cl,
            ngay_de_xuat: normalizeDateString(cl.ngay_de_xuat)!,
        })),
        distributions: data.distributions.map(d => ({
            ...d,
            ngay_phan_phoi: normalizeDateString(d.ngay_phan_phoi)!,
            ngay_thu_hoi: normalizeDateString(d.ngay_thu_hoi),
        })),
        trainings: data.trainings.map(t => ({
            ...t,
            ngay_dao_tao: normalizeDateString(t.ngay_dao_tao)!,
        })),
        risks: data.risks.map(r => ({
            ...r,
            ngay_nhan_dien: normalizeDateString(r.ngay_nhan_dien)!,
        })),
        tieuChuan: data.tieuChuan.map(tc => ({
            ...tc,
            ngay_ap_dung: normalizeDateString(tc.ngay_ap_dung)!,
            ngay_ket_thuc_ap_dung: normalizeDateString(tc.ngay_ket_thuc_ap_dung),
        })),
        auditSchedules: data.auditSchedules.map(as => ({
            ...as,
            ngay_bat_dau: normalizeDateString(as.ngay_bat_dau)!,
            ngay_ket_thuc: normalizeDateString(as.ngay_ket_thuc)!,
        })),
        // auditTrail and notifications left as-is (they may be ISO timestamps)
    };
};


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<NhanSu | null>(null);
    const [appData, setAppData] = useState<AppData>(initialAppData);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<View>({ type: 'dashboard' });
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const rawData = await getAllData();
                const normalizedData = normalizeDataDates(rawData); // Normalize dates on load
                setAppData(normalizedData);
                setError(null);
            } catch (e: any) {
                console.error("Failed to load data from server.", e);
                let errorMessage: React.ReactNode = e.message || "Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối và thử lại.";
                 if (e instanceof TypeError && (e.message.includes('Failed to fetch') || e.message.includes('Network request failed'))) {
                    errorMessage = (
                        <>
                            <strong>Lỗi kết nối mạng (CORS):</strong> Không thể tải dữ liệu. Vui lòng kiểm tra lại cấu hình triển khai Google Apps Script.
                            <br />
                            Bạn phải <strong>TRIỂN KHAI LẠI (RE-DEPLOY)</strong> kịch bản với một <strong>PHIÊN BẢN MỚI (NEW VERSION)</strong> và đặt quyền truy cập là <strong>"Anyone"</strong>.
                            <br />
                            <em className="text-xs">Lưu ý: Chỉ lưu lại file trên Apps Script là không đủ.</em>
                        </>
                    );
                }
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Automatic status updates and notifications on app load
    useEffect(() => {
        if (isLoading || !currentUser) {
            return;
        }

        const checkForOverdueTasks = () => {
            let documentsToUpdate: DanhMucTaiLieu[] = [];
            let newNotifications: ThongBao[] = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0); // local midnight
            const appUrl = window.location.origin;

            const existingNotificationKeys = new Set(
                appData.notifications.map(n => {
                    if (n.type === NotificationType.EXPIRY_APPROACHING || n.type === NotificationType.REVIEW_DUE) {
                        const daysMatch = n.message.match(/sau (\d+) ngày/);
                        if (daysMatch && daysMatch[1]) {
                            return `${n.ma_tl}_${n.type}_${daysMatch[1]}`;
                        }
                    }
                    return `${n.ma_tl}_${n.type}`;
                })
            );

            const nhanSuMap: Map<string, NhanSu> = new Map(appData.nhanSu.map(ns => [ns.id, ns]));
            const admin = appData.nhanSu.find(ns => ns.role === 'admin');
            
            // 1. Check for expired and expiring documents
            appData.documents.forEach(doc => {
                if (doc.ngay_het_hieu_luc) {
                    const expiryDate = parseYMDToLocalDate(doc.ngay_het_hieu_luc);
                    if (!expiryDate) return;

                    const diffTime = expiryDate.getTime() - today.getTime();
                    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    // Expired documents
                    if (expiryDate < today && doc.trang_thai !== DocumentStatus.HET_HIEU_LUC) {
                        documentsToUpdate.push({ ...doc, trang_thai: DocumentStatus.HET_HIEU_LUC });
                        
                        const notificationKey = `${doc.ma_tl}_${NotificationType.DOCUMENT_EXPIRED}`;
                        if (!existingNotificationKeys.has(notificationKey)) {
                            const userIdsToNotify = new Set([doc.nguoi_soan_thao, doc.nguoi_ra_soat, doc.nguoi_phe_duyet, admin?.id].filter(Boolean) as string[]);
                            const emailsToSend = new Set<string>();

                            userIdsToNotify.forEach(userId => {
                                const user = nhanSuMap.get(userId);
                                if (user) {
                                    newNotifications.push({
                                        id: `notif-${uuidv4()}`,
                                        user_id: userId,
                                        ma_tl: doc.ma_tl,
                                        type: NotificationType.DOCUMENT_EXPIRED,
                                        message: `Tài liệu "${doc.ten_tai_lieu}" đã hết hiệu lực.`,
                                        timestamp: new Date().toISOString(),
                                        is_read: false
                                    });
                                    if(user.email) emailsToSend.add(user.email);
                                }
                            });

                            if(emailsToSend.size > 0) {
                                const subject = `[ISO] Thông báo: Tài liệu "${doc.ten_tai_lieu}" đã hết hiệu lực`;
                                const emailBody = createProfessionalEmailBody(
                                    'Tài liệu đã hết hiệu lực',
                                    doc,
                                    `Tài liệu <strong>${doc.ten_tai_lieu} (${doc.ma_tl})</strong> đã hết hiệu lực vào ngày ${formatDateInGMT7(expiryDate)}.`,
                                    {
                                        "Tên tài liệu": doc.ten_tai_lieu,
                                        "Mã hiệu": doc.so_hieu,
                                        "Ngày hết hiệu lực": formatDateToYMD(expiryDate) || doc.ngay_het_hieu_luc || ''
                                    },
                                    'Xem chi tiết trên hệ thống',
                                    appUrl
                                );
                                emailsToSend.forEach(email => sendEmail(email, subject, emailBody).catch(console.error));
                            }
                            existingNotificationKeys.add(notificationKey);
                        }
                    } 
                    // Expiring documents (30 and 7 days)
                    else if (doc.trang_thai !== DocumentStatus.HET_HIEU_LUC && (daysRemaining === 30 || daysRemaining === 7)) {
                        const notificationKey = `${doc.ma_tl}_${NotificationType.EXPIRY_APPROACHING}_${daysRemaining}`;
                        if (!existingNotificationKeys.has(notificationKey)) {
                            const userIdsToNotify = new Set([doc.nguoi_soan_thao, doc.nguoi_ra_soat, doc.nguoi_phe_duyet, admin?.id].filter(Boolean) as string[]);
                            const emailsToSend = new Set<string>();
                            
                            userIdsToNotify.forEach(userId => {
                                const user = nhanSuMap.get(userId);
                                if (user) {
                                    newNotifications.push({
                                        id: `notif-${uuidv4()}`,
                                        user_id: userId,
                                        ma_tl: doc.ma_tl,
                                        type: NotificationType.EXPIRY_APPROACHING,
                                        message: `Tài liệu "${doc.ten_tai_lieu}" sắp hết hiệu lực sau ${daysRemaining} ngày.`,
                                        timestamp: new Date().toISOString(),
                                        is_read: false
                                    });
                                    if(user.email) emailsToSend.add(user.email);
                                }
                            });
                             if(emailsToSend.size > 0) {
                                const subject = `[ISO] Cảnh báo: Tài liệu "${doc.ten_tai_lieu}" sắp hết hiệu lực`;
                                const emailBody = createProfessionalEmailBody(
                                    'Cảnh báo Tài liệu Sắp hết hiệu lực',
                                    doc,
                                    `Tài liệu <strong>${doc.ten_tai_lieu} (${doc.ma_tl})</strong> sẽ hết hiệu lực sau <strong>${daysRemaining} ngày</strong> (vào ngày ${formatDateInGMT7(expiryDate)}).`,
                                    {
                                        "Tên tài liệu": doc.ten_tai_lieu,
                                        "Mã hiệu": doc.so_hieu,
                                        "Ngày hết hiệu lực": formatDateToYMD(expiryDate) || doc.ngay_het_hieu_luc || ''
                                    },
                                    'Thực hiện rà soát hoặc gia hạn',
                                    appUrl
                                );
                                emailsToSend.forEach(email => sendEmail(email, subject, emailBody).catch(console.error));
                            }
                            existingNotificationKeys.add(notificationKey);
                        }
                    }
                }
            });

            // 2. Check for due and overdue reviews
            appData.reviewSchedules.forEach(schedule => {
                const doc = appData.documents.find(d => d.ma_tl === schedule.ma_tl);
                if (!doc || schedule.ket_qua_ra_soat) return;

                const nextReviewDate = parseYMDToLocalDate(schedule.ngay_ra_soat_ke_tiep);
                if (!nextReviewDate) return;
                
                const diffTime = nextReviewDate.getTime() - today.getTime();
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Overdue reviews
                if (nextReviewDate < today) {
                    if (doc.trang_thai === DocumentStatus.DA_BAN_HANH) {
                         documentsToUpdate.push({ ...doc, trang_thai: DocumentStatus.DANG_RA_SOAT });
                    }
                    const notificationKey = `${doc.ma_tl}_${NotificationType.REVIEW_OVERDUE}`;
                    if (!existingNotificationKeys.has(notificationKey)) {
                        const userIdsToNotify = new Set([schedule.nguoi_chiu_trach_nhiem, admin?.id].filter(Boolean) as string[]);
                        const emailsToSend = new Set<string>();

                        userIdsToNotify.forEach(userId => {
                            const user = nhanSuMap.get(userId);
                            if (user) {
                                newNotifications.push({
                                    id: `notif-${uuidv4()}`,
                                    user_id: userId,
                                    ma_tl: doc.ma_tl,
                                    type: NotificationType.REVIEW_OVERDUE,
                                    message: `Tài liệu "${doc.ten_tai_lieu}" đã quá hạn rà soát.`,
                                    timestamp: new Date().toISOString(),
                                    is_read: false
                                });
                                if (user.email) emailsToSend.add(user.email);
                            }
                        });
                        if (emailsToSend.size > 0) {
                            const subject = `[ISO] Cảnh báo: Tài liệu "${doc.ten_tai_lieu}" đã QUÁ HẠN rà soát`;
                            const emailBody = createProfessionalEmailBody(
                                'Tài liệu đã quá hạn rà soát',
                                doc,
                                `Tài liệu <strong>${doc.ten_tai_lieu} (${doc.ma_tl})</strong> đã quá hạn rà soát (hạn chót: ${formatDateInGMT7(nextReviewDate)}).`,
                                {
                                    "Tên tài liệu": doc.ten_tai_lieu,
                                    "Mã hiệu": doc.so_hieu,
                                    "Hạn rà soát": formatDateToYMD(nextReviewDate) || schedule.ngay_ra_soat_ke_tiep || ''
                                },
                                'Thực hiện rà soát ngay',
                                appUrl
                            );
                            emailsToSend.forEach(email => sendEmail(email, subject, emailBody).catch(console.error));
                        }
                        existingNotificationKeys.add(notificationKey);
                    }
                }
                // Reviews due soon (30 and 7 days)
                else if (daysRemaining === 30 || daysRemaining === 7) {
                    const notificationKey = `${doc.ma_tl}_${NotificationType.REVIEW_DUE}_${daysRemaining}`;
                     if (!existingNotificationKeys.has(notificationKey)) {
                        const userIdsToNotify = new Set([schedule.nguoi_chiu_trach_nhiem, admin?.id].filter(Boolean) as string[]);
                        const emailsToSend = new Set<string>();
                        
                        userIdsToNotify.forEach(userId => {
                            const user = nhanSuMap.get(userId);
                            if (user) {
                                newNotifications.push({
                                    id: `notif-${uuidv4()}`,
                                    user_id: userId,
                                    ma_tl: doc.ma_tl,
                                    type: NotificationType.REVIEW_DUE,
                                    message: `Tài liệu "${doc.ten_tai_lieu}" sắp đến hạn rà soát sau ${daysRemaining} ngày.`,
                                    timestamp: new Date().toISOString(),
                                    is_read: false
                                });
                                if(user.email) emailsToSend.add(user.email);
                            }
                        });

                        if (emailsToSend.size > 0) {
                            const subject = `[ISO] Nhắc nhở: Rà soát tài liệu "${doc.ten_tai_lieu}"`;
                            const emailBody = createProfessionalEmailBody(
                                'Nhắc nhở Rà soát Tài liệu',
                                doc,
                                `Tài liệu <strong>${doc.ten_tai_lieu} (${doc.ma_tl})</strong> sắp đến hạn rà soát sau <strong>${daysRemaining} ngày</strong> (hạn chót: ${formatDateInGMT7(nextReviewDate)}).`,
                                {
                                    "Tên tài liệu": doc.ten_tai_lieu,
                                    "Mã hiệu": doc.so_hieu,
                                    "Hạn rà soát": formatDateToYMD(nextReviewDate) || schedule.ngay_ra_soat_ke_tiep || ''
                                },
                                'Chuẩn bị rà soát',
                                appUrl
                            );
                            emailsToSend.forEach(email => sendEmail(email, subject, emailBody).catch(console.error));
                        }
                        existingNotificationKeys.add(notificationKey);
                    }
                }
            });

            if (documentsToUpdate.length > 0 || newNotifications.length > 0) {
                 setAppData(prevData => {
                    const updatedDocsMap = new Map(documentsToUpdate.map(doc => [doc.ma_tl, doc]));
                    const finalDocuments = prevData.documents.map(doc => updatedDocsMap.get(doc.ma_tl) || doc);
                    
                    return {
                        ...prevData,
                        documents: finalDocuments,
                        notifications: [...prevData.notifications, ...newNotifications]
                    };
                });
            }
        };

        checkForOverdueTasks();
    }, [isLoading, currentUser, appData.notifications, appData.documents, appData.reviewSchedules, appData.nhanSu]);


    // Persist data changes (debounced)
    useEffect(() => {
        if (isLoading) return; // Don't save initial mock data load

        setIsSaving(true);
        const handler = setTimeout(() => {
            updateAllData(appData)
                .then(() => {
                    console.log("Data saved successfully.");
                    setError(null);
                })
                .catch(e => {
                    console.error("Failed to save data.", e);
                    let errorMessage: React.ReactNode = "Lỗi: Không thể lưu thay đổi vào máy chủ.";
                     if (e instanceof TypeError && (e.message.includes('Failed to fetch') || e.message.includes('Network request failed'))) {
                        errorMessage = (
                            <>
                                <strong>Lỗi kết nối mạng (CORS):</strong> Không thể lưu dữ liệu. Vui lòng kiểm tra lại cấu hình triển khai Google Apps Script.
                                <br />
                                Bạn phải <strong>TRIỂN KHAI LẠI (RE-DEPLOY)</strong> kịch bản với một <strong>PHIÊN BẢN MỚI (NEW VERSION)</strong> và đặt quyền truy cập là <strong>"Anyone"</strong>.
                                <br />
                                <em className="text-xs">Lưu ý: Chỉ lưu lại file trên Apps Script là không đủ.</em>
                            </>
                        );
                    }
                    setError(errorMessage);
                })
                .finally(() => setIsSaving(false));
        }, 1500); // Debounce saves by 1.5 seconds

        return () => {
            clearTimeout(handler);
        };
    }, [appData, isLoading]);
    
    // Login and Logout handlers
    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        const user = await login(username, password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setView({ type: 'dashboard' });
    };

    // Navigation handlers
    const handleNavigate = useCallback((viewType: any) => {
        setView({ type: viewType });
    }, []);
    
    const handleNavigateToDocument = useCallback((docId: string) => {
        setView({ type: 'documentDetail', docId });
    }, []);
    
    const handleNavigateToDocumentsWithFilter = useCallback((filter: string | null) => {
        setView({ type: 'documents', filter });
    }, []);

    const handleNavigateToReport = useCallback((reportType: ReportType) => {
        setView({ type: 'reports', reportType });
    }, []);
    
    // Data modification handlers
    const handleToggleBookmark = useCallback((docId: string) => {
        setAppData(prevData => ({
            ...prevData,
            documents: prevData.documents.map(doc =>
                doc.ma_tl === docId ? { ...doc, is_bookmarked: !doc.is_bookmarked } : doc
            )
        }));
    }, []);

    const handleUpdateDocument = useCallback((updatedDoc: DanhMucTaiLieu) => {
        setAppData(prev => ({
            ...prev,
            documents: prev.documents.map(d => d.ma_tl === updatedDoc.ma_tl ? updatedDoc : d)
        }));
    }, []);
    
    const handleUpdateVersionStatus = useCallback((versionId: string, newStatus: VersionStatus) => {
        setAppData(prev => {
            const targetVersion = prev.versions.find(v => v.id_phien_ban === versionId);
            if (!targetVersion) {
                return prev; // Safety check if version not found
            }

            let updatedVersions = prev.versions;
            let updatedDocuments = prev.documents;

            if (newStatus === VersionStatus.BAN_HANH) {
                const docId = targetVersion.ma_tl;
                
                // 1. Update versions array:
                //    - Set the target version's status to BAN_HANH and is_moi_nhat to true.
                //    - Set all other versions of the same document to is_moi_nhat = false.
                updatedVersions = prev.versions.map(v => {
                    if (v.ma_tl === docId) {
                        return {
                            ...v,
                            trang_thai_phien_ban: v.id_phien_ban === versionId ? newStatus : v.trang_thai_phien_ban,
                            is_moi_nhat: v.id_phien_ban === versionId,
                        };
                    }
                    return v;
                });

                // 2. Update documents array:
                //    - Find the parent document and update its status and issue date.
                updatedDocuments = prev.documents.map(doc => {
                    if (doc.ma_tl === docId) {
                        return { 
                            ...doc, 
                            trang_thai: DocumentStatus.DA_BAN_HANH,
                            ngay_ban_hanh: targetVersion.ngay_phat_hanh 
                        };
                    }
                    return doc;
                });
            } else {
                // For other status changes (e.g., Draft -> For Approval), just update the version.
                updatedVersions = prev.versions.map(v => 
                    v.id_phien_ban === versionId 
                        ? { ...v, trang_thai_phien_ban: newStatus } 
                        : v
                );
            }
            
            return { ...prev, versions: updatedVersions, documents: updatedDocuments };
        });
    }, []);

    const handleSaveRelatedData = useCallback((type: string, data: any) => {
        const key = type as keyof AppData;
        setAppData(prev => {
            let newList;
            const idKey = Object.keys(data).find(k => k.startsWith('id_'));

            if (idKey && data[idKey]) { // Update existing
                newList = (prev[key] as any[]).map(item => item[idKey] === data[idKey] ? data : item);
            } else { // Add new
                const idPrefix = type === 'changeLogs' ? 'cl' :
                                 type === 'distributions' ? 'pp' :
                                 type.slice(0, 2);
                const newIdKey = `id_${type.slice(0, -1)}`;
                const newItem = { ...data, [newIdKey]: `${idPrefix}-${uuidv4()}` };
                newList = [...(prev[key] as any[]), newItem];
            }

            if (key === 'reviewSchedules' && data.ket_qua_ra_soat && data.id_lich) {
                const oldSchedule = (prev.reviewSchedules as LichRaSoat[]).find(rs => rs.id_lich === data.id_lich);
                const tanSuat = prev.tanSuatRaSoat.find(ts => ts.id === oldSchedule?.tan_suat);
                if (tanSuat?.so_thang && data.ngay_ra_soat_thuc_te) {
                    // Use local Date parsing and local-format output (YYYY-MM-DD)
                    const nextReviewDate = parseYMDToLocalDate(data.ngay_ra_soat_thuc_te);
                    if (nextReviewDate) {
                        nextReviewDate.setMonth(nextReviewDate.getMonth() + tanSuat.so_thang);
                        const newSchedule: LichRaSoat = {
                            id_lich: `rs-${uuidv4()}`,
                            ma_tl: oldSchedule!.ma_tl,
                            tan_suat: oldSchedule!.tan_suat,
                            ngay_ra_soat_ke_tiep: formatDateToYMD(nextReviewDate)!,
                            nguoi_chiu_trach_nhiem: oldSchedule!.nguoi_chiu_trach_nhiem,
                        };
                        newList.push(newSchedule);
                    }
                }
            }

            return { ...prev, [key]: newList };
        });
    }, []);

    const handleDeleteRelatedData = useCallback((type: string, data: any) => {
        const key = type as keyof AppData;
        const idKey = Object.keys(data).find(k => k.startsWith('id_'))!;
        setAppData(prev => ({
            ...prev,
            [key]: (prev[key] as any[]).filter(item => item[idKey] !== data[idKey]),
        }));
    }, []);

    const handleSaveCategory = useCallback((categoryKey: keyof AppData, item: any) => {
         setAppData(prev => {
            const list = prev[categoryKey] as any[];
            let newList;
            if (item.id) {
                newList = list.map(i => i.id === item.id ? item : i);
            } else {
                const newId = `${categoryKey}-${uuidv4()}`;
                newList = [...list, { ...item, id: newId, is_active: true }];
            }
            return { ...prev, [categoryKey]: newList };
        });
    }, []);

    const handleDeleteCategory = useCallback((categoryKey: keyof AppData, item: any) => {
        setAppData(prev => ({
            ...prev,
            [categoryKey]: (prev[categoryKey] as any[]).filter(i => i.id !== item.id)
        }));
    }, []);

    const handleToggleCategoryStatus = useCallback((categoryKey: keyof AppData, item: any) => {
        setAppData(prev => ({
            ...prev,
            [categoryKey]: (prev[categoryKey] as any[]).map(i => i.id === item.id ? { ...i, is_active: i.is_active === false } : i)
        }));
    }, []);
    
    const handleMarkNotificationRead = useCallback((notificationId: string) => {
        setAppData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        }));
    }, []);

    const handleMarkAllNotificationsRead = useCallback(() => {
        setAppData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, is_read: true }))
        }));
    }, []);


    const renderView = () => {
        if (isLoading && !currentUser) { // Show skeleton only on initial load before login
            return <DashboardSkeleton />;
        }

        if (error && appData.documents.length === 0) {
            return (
                <div className="flex items-center justify-center"h-full p-4>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-lg text-center" role="alert">
                        <strong className="font-bold">Đã xảy ra lỗi!</strong>
                        <p className="block sm:inline mt-2">{error}</p>
                    </div>
                </div>
            );
        }

        const currentViewType = view.type;

        switch (currentViewType) {
            case 'dashboard':
                return <Dashboard 
                    documents={appData.documents}
                    versions={appData.versions}
                    currentUser={currentUser!}
                    departments={appData.phongBan}
                    auditSchedules={appData.auditSchedules}
                    nhanSu={appData.nhanSu}
                    onNavigate={handleNavigate}
                    onNavigateToReport={handleNavigateToReport}
                    onNavigateToDocument={handleNavigateToDocument}
                    onNavigateToDocumentsWithFilter={handleNavigateToDocumentsWithFilter}
                />;
            
            case 'documents':
                return <DocumentManagementPage 
                    allData={appData}
                    onUpdateData={setAppData}
                    currentUser={currentUser!}
                    onViewDetails={(doc) => handleNavigateToDocument(doc.ma_tl)}
                    onToggleBookmark={handleToggleBookmark}
                    initialFilter={(view as { type: 'documents'; filter: string | null }).filter}
                />;

            case 'documentDetail':
                const doc = appData.documents.find(d => d.ma_tl === (view as { type: 'documentDetail'; docId: string }).docId);
                return doc ? <DocumentDetail
                    document={doc}
                    allData={appData}
                    onBack={() => setView({ type: 'documents', filter: null })}
                    onSaveRelatedData={handleSaveRelatedData}
                    onDeleteRelatedData={handleDeleteRelatedData}
                    onUpdateDocument={handleUpdateDocument}
                    onUpdateVersionStatus={handleUpdateVersionStatus}
                    onToggleBookmark={handleToggleBookmark}
                    currentUser={currentUser!}
                /> : <div>Không tìm thấy tài liệu.</div>;
            
            case 'audits':
                 return <AuditManagementPage allData={appData} onUpdateData={setAppData} currentUser={currentUser!} />;
            
            case 'reports':
                return <ReportsPage allData={appData} initialReportType={(view as {type: 'reports', reportType: ReportType | null}).reportType} onViewDetails={(doc) => handleNavigateToDocument(doc.ma_tl)} currentUser={currentUser!} />;

             case 'reports-detailed':
                return <div>Trang Báo cáo Chi tiết (placeholder)</div>;

            case 'report-by-employee':
                return <div>Trang Báo cáo theo Nhân viên (placeholder)</div>;

            case 'audit-log':
                return <AuditLogPage auditLogs={appData.auditTrail} users={appData.nhanSu} />;

            case 'settings':
                return <SettingsPage />;
            
            case 'settings-group-org':
                return <GroupedCategoryPage
                    group="org"
                    title="Quản lý Tổ chức & Nhân sự"
                    allData={appData}
                    onSaveCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onToggleCategoryStatus={handleToggleCategoryStatus}
                    onUpdateData={setAppData}
                    currentUser={currentUser!}
                />;
            case 'settings-group-doc':
                return <GroupedCategoryPage
                    group="doc"
                    title="Quản lý Cấu hình Tài liệu"
                    allData={appData}
                    onSaveCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onToggleCategoryStatus={handleToggleCategoryStatus}
                    onUpdateData={setAppData}
                    currentUser={currentUser!}
                />;
            case 'settings-group-audit':
                return <GroupedCategoryPage
                    group="audit"
                    title="Quản lý Tiêu chuẩn & Đánh giá"
                    allData={appData}
                    onSaveCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onToggleCategoryStatus={handleToggleCategoryStatus}
                    onUpdateData={setAppData}
                    currentUser={currentUser!}
                />;
                
            default:
                return <div>Không tìm thấy trang.</div>;
        }
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const currentViewString = view.type;

    return (
        <Layout
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            notifications={appData.notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onNavigateToDocument={handleNavigateToDocument}
            currentView={currentViewString}
            onNavigateToReport={handleNavigateToReport}
            chucVuList={appData.chucVu}
        >
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {isSaving && <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-md shadow-lg z-50 animate-pulse">Đang lưu...</div>}
            {renderView()}
        </Layout>
    );
};

export default App;
