import React, { useState, useEffect, useCallback, useRef } from 'react';
import { mockData } from './data/mockData';
import type { DanhMucTaiLieu, NhanSu, ThongBao, ReportType, LichRaSoat, ChucVu, AuditLog, LichAudit, DaoTaoTruyenThong, PhienBanTaiLieu, DanhMucChung, PhongBan, LoaiTaiLieu, CapDoTaiLieu, MucDoBaoMat, TanSuatRaSoat, HangMucThayDoi, ToChucDanhGia, DanhGiaVien } from './types';
import { DocumentStatus, NotificationType, AuditAction, VersionStatus, ReviewResult } from './constants';
import Layout from './components/layout/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DocumentManagementPage from './components/DocumentManagementPage';
import DocumentDetail from './components/DocumentDetail';
import SettingsPage from './components/SettingsPage';
import CategoryManagementPage from './components/CategoryManagementPage';
import StandardsManagementPage from './components/StandardsManagementPage';
import ReportsPage from './components/ReportsPage';
import AuditManagementPage from './components/AuditManagementPage';
import AuditLogPage from './components/AuditLogPage';
import { v4 as uuidv4 } from 'uuid';
import { formatDateForDisplay } from './utils/dateUtils';
import { translate } from './utils/translations';
import { GOOGLE_SCRIPT_URL } from './config';
import { getAllData, updateAllData, login } from './services/api';

// Import forms for Category Management
import PersonnelForm from './components/forms/PersonnelForm';
import DepartmentForm from './components/forms/DepartmentForm';
import GenericCategoryForm from './components/forms/GenericCategoryForm';
import AuditorForm from './components/forms/AuditorForm';
// FIX: Import Badge component to resolve 'Cannot find name 'Badge'' error.
import Badge from './components/ui/Badge';


type View = 'dashboard' | 'documents' | 'document-detail' | 'settings' | 'standards' | 'reports' | 'audits' | 'audit-log' |
    'settings-personnel' | 'settings-departments' | 'settings-positions' | 'settings-docTypes' | 'settings-docLevels' |
    'settings-securityLevels' | 'settings-reviewFrequencies' | 'settings-changeItems' | 'settings-auditors' | 'settings-auditOrgs';


const App: React.FC = () => {
    const [data, setData] = useState<typeof mockData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);

    const [currentUser, setCurrentUser] = useState<NhanSu | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [initialReportType, setInitialReportType] = useState<ReportType | null>(null);
    const [initialDocFilter, setInitialDocFilter] = useState<string | null>(null);
    
    const isUpdating = useRef(false);

    const fetchData = useCallback(async () => {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('AKfycbw-C_pFUfOYtzWPqwQ1kYgP6cucA5AVe4LTcENv-89COXalBqZejq6gwsAiH96lYZoB')) {
            setError("Vui lòng cấu hình URL Google Apps Script trong file config.ts.");
            setIsLoading(false);
            setData(mockData); // Fallback to mockData for UI development
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // The result from the API might be an incomplete object if some sheets are missing.
            const result = await getAllData();

            const parseStringToArray = (field: any): string[] => {
                if (Array.isArray(field)) return field;
                if (field && typeof field === 'string') {
                    return field.split(',').map(s => s.trim()).filter(Boolean);
                }
                return [];
            };
            
            // Create a new data object by merging the result with the mockData structure.
            // This ensures all expected array properties are present to prevent .map errors.
            const dataWithFallbacks: any = {};
            for (const key of Object.keys(mockData)) {
                // Use the fetched data if available, otherwise use the mockData value (which is an empty array).
                dataWithFallbacks[key] = (result as any)?.[key] || (mockData as any)[key];
            }

            // Now, perform the string-to-array parsing on the guaranteed arrays.
            // This is necessary because data from Google Sheets can come as comma-separated strings.
            dataWithFallbacks.documents = (dataWithFallbacks.documents || []).map((doc: DanhMucTaiLieu) => ({
                ...doc,
                pham_vi_ap_dung: parseStringToArray(doc.pham_vi_ap_dung),
                tieu_chuan_ids: parseStringToArray(doc.tieu_chuan_ids),
                iso_tham_chieu: parseStringToArray(doc.iso_tham_chieu),
                tieu_chuan_khac: parseStringToArray(doc.tieu_chuan_khac),
                phap_ly_tham_chieu: parseStringToArray(doc.phap_ly_tham_chieu),
            }));
            dataWithFallbacks.auditSchedules = (dataWithFallbacks.auditSchedules || []).map((audit: LichAudit) => ({
                ...audit,
                tieu_chuan_ids: parseStringToArray(audit.tieu_chuan_ids),
                doan_danh_gia_ids: parseStringToArray(audit.doan_danh_gia_ids),
                tai_lieu_lien_quan_ids: parseStringToArray(audit.tai_lieu_lien_quan_ids),
            }));
            dataWithFallbacks.trainings = (dataWithFallbacks.trainings || []).map((training: DaoTaoTruyenThong) => ({
                ...training,
                phong_ban_tham_gia: parseStringToArray(training.phong_ban_tham_gia),
            }));

            setData(dataWithFallbacks);
        } catch (e: any) {
            console.error("Failed to fetch data from Google Sheets:", e);
            let detailedError: React.ReactNode = `Không thể tải dữ liệu từ Google Sheets. Lỗi: ${e.message}. Vui lòng kiểm tra lại cấu hình và thử lại.`;
            if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
                detailedError = (
                    <>
                        Lỗi kết nối mạng (CORS). Vui lòng kiểm tra lại cấu hình triển khai Google Apps Script. 
                        Bạn phải <strong>TRIỂN KHAI LẠI (RE-DEPLOY)</strong> kịch bản với một <strong>PHIÊN BẢN MỚI (NEW VERSION)</strong> và đặt quyền truy cập là <strong>"Anyone"</strong>. 
                        <br />
                        Chỉ lưu lại file là không đủ.
                    </>
                );
            }
            setError(detailedError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateRemoteData = useCallback(async (updatedData: typeof mockData) => {
        if (isUpdating.current) {
            console.log("Update already in progress, skipping.");
            return;
        }
        isUpdating.current = true;
        try {
            await updateAllData(updatedData);
        } catch (e: any) {
            console.error("Failed to update data in Google Sheets:", e);
            let detailedError: React.ReactNode = `Lỗi kết nối khi đồng bộ dữ liệu. Thay đổi của bạn có thể chưa được lưu. Lỗi: ${e.message}.`;
            if (e instanceof TypeError && (e.message.includes('Failed to fetch') || e.message.includes('Network request failed'))) {
                detailedError = (
                    <>
                        Lỗi kết nối mạng (CORS). <strong>Thay đổi của bạn có thể chưa được lưu.</strong>
                        <br />
                        Vui lòng kiểm tra lại cấu hình triển khai Google Apps Script. 
                        Bạn phải <strong>TRIỂN KHAI LẠI (RE-DEPLOY)</strong> kịch bản với một <strong>PHIÊN BẢN MỚI (NEW VERSION)</strong> và đặt quyền truy cập là <strong>"Anyone"</strong>. 
                        <br />
                        Chỉ việc lưu lại file kịch bản là không đủ.
                    </>
                );
            }
            setError(detailedError);
        } finally {
            isUpdating.current = false;
        }
    }, []);

    // Fetch data on initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSetData = (updater: React.SetStateAction<typeof mockData | null>) => {
        setData(prevData => {
            const newData = typeof updater === 'function' ? updater(prevData) : updater;
            
            if (newData && JSON.stringify(prevData) !== JSON.stringify(newData)) {
                // Remove debounce and call update immediately
                updateRemoteData(newData);
            }
            return newData;
        });
    };

    const addAuditLog = useCallback((action: AuditAction, details: string, entity_type: string = 'system', entity_id?: string) => {
        const user = currentUser; // Capture current user at the time of action
        const newLog: AuditLog = {
            id: `log-${uuidv4()}`,
            timestamp: new Date().toISOString(),
            user_id: user?.id || 'system',
            user_name: user?.ten || 'Hệ thống',
            action,
            entity_type,
            entity_id,
            details,
        };
        // Use a functional update to ensure we're not overwriting other state changes
        handleSetData(prev => {
            if (!prev) return null;
            return { ...prev, auditTrail: [newLog, ...(prev.auditTrail || [])] };
        });
    }, [currentUser]); // Depend on currentUser to get the correct user info


    // Sync currentUser with full details from the main data source after login.
    // This ensures permissions are correctly loaded if the login endpoint returns a partial user object.
    useEffect(() => {
        if (currentUser && data?.nhanSu) {
            const fullUserDetails = data.nhanSu.find(u => u.id === currentUser.id);
            // Only update if the user is found and is different, to avoid re-render loops.
            if (fullUserDetails && JSON.stringify(currentUser) !== JSON.stringify(fullUserDetails)) {
                setCurrentUser(fullUserDetails);
            }
        }
    }, [data, currentUser]);

    // Automatic status updates based on dates
    useEffect(() => {
        if (currentUser && data) {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            const dueReviewDocIds = new Set(
                data.reviewSchedules
                    .filter(schedule => {
                        if (schedule.ngay_ra_soat_thuc_te) return false;
                        const reviewDate = new Date(schedule.ngay_ra_soat_ke_tiep);
                        reviewDate.setUTCHours(0, 0, 0, 0);
                        return reviewDate <= today;
                    })
                    .map(s => s.ma_tl)
            );

            let documentsChanged = false;
            const updatedDocuments = data.documents.map(doc => {
                let newStatus = doc.trang_thai;
                if (doc.trang_thai === DocumentStatus.DA_BAN_HANH && doc.ngay_het_hieu_luc) {
                    const expiryDate = new Date(doc.ngay_het_hieu_luc);
                    expiryDate.setUTCHours(0, 0, 0, 0);
                    if (expiryDate <= today) {
                        newStatus = DocumentStatus.HET_HIEU_LUC;
                    }
                }
                if (newStatus === DocumentStatus.DA_BAN_HANH && dueReviewDocIds.has(doc.ma_tl)) {
                    newStatus = DocumentStatus.DANG_RA_SOAT;
                }
                if (newStatus !== doc.trang_thai) {
                    documentsChanged = true;
                    return { ...doc, trang_thai: newStatus };
                }
                return doc;
            });

            if (documentsChanged) {
                handleSetData(prev => prev ? ({ ...prev, documents: updatedDocuments }) : null);
            }
        }
    }, [currentUser, data]);
    
    // Generate notifications
    useEffect(() => {
        if (currentUser && data) {
            const newNotifications: ThongBao[] = [];
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            const generatedKeys = new Set<string>();

            const addNotification = (notification: Omit<ThongBao, 'id' | 'timestamp' | 'is_read'>) => {
                const key = `${notification.type}-${notification.ma_tl}`;
                if (!generatedKeys.has(key)) {
                    newNotifications.push({
                        id: uuidv4(),
                        ...notification,
                        timestamp: new Date().toISOString(),
                        is_read: false,
                    });
                    generatedKeys.add(key);
                }
            };
            
            data.documents.forEach(doc => {
                if (doc.nguoi_phe_duyet === currentUser.id && doc.trang_thai === DocumentStatus.CHO_PHE_DUYET) {
                    addNotification({ user_id: currentUser.id, ma_tl: doc.ma_tl, type: NotificationType.APPROVAL_PENDING, message: `Tài liệu "${doc.ten_tai_lieu}" đang chờ bạn phê duyệt.` });
                }
            });

            data.reviewSchedules.forEach(schedule => {
                if (schedule.nguoi_chiu_trach_nhiem === currentUser.id && !schedule.ngay_ra_soat_thuc_te) {
                    const doc = data.documents.find(d => d.ma_tl === schedule.ma_tl);
                    if (!doc) return;
                    const reviewDate = new Date(schedule.ngay_ra_soat_ke_tiep);
                    reviewDate.setUTCHours(0,0,0,0);
                    const diffDays = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 0) {
                        addNotification({ user_id: currentUser.id, ma_tl: doc.ma_tl, type: NotificationType.REVIEW_OVERDUE, message: `Tài liệu "${doc.ten_tai_lieu}" đã quá hạn rà soát.` });
                    } else if (diffDays <= 7) {
                        addNotification({ user_id: currentUser.id, ma_tl: doc.ma_tl, type: NotificationType.REVIEW_DUE, message: `Tài liệu "${doc.ten_tai_lieu}" sắp đến hạn rà soát (${formatDateForDisplay(schedule.ngay_ra_soat_ke_tiep)}).` });
                    }
                }
            });
            
            data.documents.forEach(doc => {
                if (doc.nguoi_ra_soat === currentUser.id && doc.ngay_het_hieu_luc) {
                    const expiryDate = new Date(doc.ngay_het_hieu_luc);
                    expiryDate.setUTCHours(0,0,0,0);
                    if (expiryDate < today) return;
                    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 30) {
                        addNotification({ user_id: currentUser.id, ma_tl: doc.ma_tl, type: NotificationType.EXPIRY_APPROACHING, message: `Tài liệu "${doc.ten_tai_lieu}" sắp hết hiệu lực vào ngày ${formatDateForDisplay(doc.ngay_het_hieu_luc)}.` });
                    }
                }
            });
            handleSetData(prev => prev ? ({...prev, notifications: newNotifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) }) : null);
        }
    }, [currentUser, data?.documents, data?.reviewSchedules]);

    useEffect(() => {
        if (view !== 'reports') {
            setInitialReportType(null);
        }
        if (view !== 'documents') {
            setInitialDocFilter(null);
        }
    }, [view]);

    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        const user = await login(username, password);
        if (user) {
            await fetchData(); // Refetch all data after successful login
            setCurrentUser(user);
            addAuditLog(AuditAction.LOGIN_SUCCESS, `Người dùng '${user.ten}' đăng nhập thành công.`);
            return true;
        } else {
            addAuditLog(AuditAction.LOGIN_FAIL, `Đăng nhập thất bại với tên đăng nhập: '${username}'.`);
            return false;
        }
    };

    const handleLogout = () => {
        if(currentUser) {
            addAuditLog(AuditAction.LOGOUT, `Người dùng '${currentUser.ten}' đã đăng xuất.`);
        }
        setCurrentUser(null);
    };

    const handleNavigate = (newView: View, docId: string | null = null) => {
        setView(newView);
        setSelectedDocId(docId);
    };

    const handleNavigateToReport = (reportType: ReportType) => {
        setView('reports');
        setInitialReportType(reportType);
    };

    const handleNavigateToDocumentsWithFilter = (filter: 'bookmarked') => {
        setView('documents');
        setInitialDocFilter(filter);
    };
    
    const handleViewDetails = (doc: DanhMucTaiLieu) => {
        handleNavigate('document-detail', doc.ma_tl);
    }
    
    const handleSaveRelatedData = (type: string, relatedData: any) => {
        if (type === 'reviewSchedules' && relatedData.ngay_ra_soat_thuc_te && relatedData.ket_qua_ra_soat) {
            const completedReview = relatedData as LichRaSoat;
            handleSetData(prevData => {
                if (!prevData) return null;

                // 1. Update the document status based on review result
                let nextDocuments = [...prevData.documents];
                const docIndex = nextDocuments.findIndex(d => d.ma_tl === completedReview.ma_tl);
                if (docIndex > -1) {
                    const updatedDoc = { ...nextDocuments[docIndex] };
                    switch (completedReview.ket_qua_ra_soat) {
                        case ReviewResult.TIEP_TUC:
                            updatedDoc.trang_thai = DocumentStatus.DA_BAN_HANH;
                            break;
                        case ReviewResult.CAN_SUA:
                            updatedDoc.trang_thai = DocumentStatus.DANG_RA_SOAT;
                            break;
                        case ReviewResult.THU_HOI:
                            updatedDoc.trang_thai = DocumentStatus.HET_HIEU_LUC;
                            break;
                    }
                    nextDocuments[docIndex] = updatedDoc;
                }

                // 2. Update the review schedule list
                let nextReviewSchedules = [...prevData.reviewSchedules];
                const scheduleIndex = nextReviewSchedules.findIndex(s => s.id_lich === completedReview.id_lich);
                if (scheduleIndex > -1) {
                    nextReviewSchedules[scheduleIndex] = completedReview;
                } else {
                     nextReviewSchedules.push({ ...completedReview, id_lich: `rs-${uuidv4()}` });
                }

                // 3. Create next review schedule if the document continues
                if (completedReview.ket_qua_ra_soat === ReviewResult.TIEP_TUC) {
                    const frequency = prevData.tanSuatRaSoat.find(ts => ts.id === completedReview.tan_suat);
                    if (frequency && frequency.so_thang) {
                        const lastReviewDate = new Date(completedReview.ngay_ra_soat_thuc_te!);
                        const nextReviewDate = new Date(lastReviewDate.setMonth(lastReviewDate.getMonth() + frequency.so_thang));
                        const newReviewSchedule: LichRaSoat = {
                            id_lich: `rs-${uuidv4()}`,
                            ma_tl: completedReview.ma_tl, tan_suat: completedReview.tan_suat,
                            ngay_ra_soat_ke_tiep: nextReviewDate.toISOString().split('T')[0],
                            nguoi_chiu_trach_nhiem: completedReview.nguoi_chiu_trach_nhiem,
                            ghi_chu: `Lịch tự động tạo từ chu kỳ trước.`,
                        };
                        nextReviewSchedules.push(newReviewSchedule);
                    }
                }
                
                return { ...prevData, documents: nextDocuments, reviewSchedules: nextReviewSchedules };
            });
            addAuditLog(AuditAction.UPDATE, `Hoàn thành rà soát cho tài liệu ${completedReview.ma_tl} với kết quả: ${translate(completedReview.ket_qua_ra_soat!)}.`, 'reviewSchedules', completedReview.id_lich);
            return;
        }
        
        if (type === 'versions') {
            const isNew = !relatedData.id_phien_ban;
            handleSetData(prevData => {
                if (!prevData) return null;
        
                const savedVersion = { ...relatedData, id_phien_ban: relatedData.id_phien_ban || `v-${uuidv4()}` };
        
                let otherVersions = prevData.versions.filter(v => v.id_phien_ban !== savedVersion.id_phien_ban);
        
                if (savedVersion.is_moi_nhat) {
                    otherVersions = otherVersions.map(v => {
                        if (v.ma_tl === savedVersion.ma_tl) {
                            const updatedV = { ...v, is_moi_nhat: false };
                            if (savedVersion.trang_thai_phien_ban === VersionStatus.BAN_HANH && v.trang_thai_phien_ban === VersionStatus.BAN_HANH) {
                                updatedV.trang_thai_phien_ban = VersionStatus.THU_HOI;
                            }
                            return updatedV;
                        }
                        return v;
                    });
                }
        
                const nextVersions = [...otherVersions, savedVersion];
                let nextDocuments = [...prevData.documents];
                const docIndex = nextDocuments.findIndex(d => d.ma_tl === savedVersion.ma_tl);
        
                if (docIndex > -1) {
                    const originalDoc = nextDocuments[docIndex];
                    const updatedDoc = { ...originalDoc };
        
                    const latestVersionForDoc = nextVersions
                        .filter(v => v.ma_tl === savedVersion.ma_tl)
                        .find(v => v.is_moi_nhat);
        
                    let baseStatus = originalDoc.trang_thai;
        
                    if (latestVersionForDoc) {
                        switch (latestVersionForDoc.trang_thai_phien_ban) {
                            case VersionStatus.BAN_HANH:
                                baseStatus = DocumentStatus.DA_BAN_HANH;
                                updatedDoc.ngay_ban_hanh = latestVersionForDoc.ngay_phat_hanh;
                                updatedDoc.ngay_hieu_luc = latestVersionForDoc.ngay_phat_hanh;
                                break;
                            case VersionStatus.PHE_DUYET:
                                baseStatus = DocumentStatus.CHO_PHE_DUYET;
                                break;
                            case VersionStatus.BAN_THAO:
                                if (originalDoc.trang_thai !== DocumentStatus.NHAP) {
                                    baseStatus = DocumentStatus.DANG_RA_SOAT;
                                }
                                break;
                        }
                    } else if (isNew && originalDoc.trang_thai === DocumentStatus.DA_BAN_HANH) {
                        baseStatus = DocumentStatus.DANG_RA_SOAT;
                    }
        
                    // --- Overriding Logic ---
                    const today = new Date();
                    today.setUTCHours(0, 0, 0, 0);
                    let finalStatus = baseStatus;
        
                    // Priority 1: Expiry date is the ultimate override.
                    if (updatedDoc.ngay_het_hieu_luc) {
                        const expiryDate = new Date(updatedDoc.ngay_het_hieu_luc);
                        expiryDate.setUTCHours(0, 0, 0, 0);
                        if (expiryDate <= today) {
                            finalStatus = DocumentStatus.HET_HIEU_LUC;
                        }
                    }
        
                    // Priority 2: Overdue review overrides 'Published'.
                    if (finalStatus === DocumentStatus.DA_BAN_HANH) {
                        const isDueForReview = prevData.reviewSchedules.some(s =>
                            s.ma_tl === updatedDoc.ma_tl &&
                            !s.ngay_ra_soat_thuc_te &&
                            new Date(s.ngay_ra_soat_ke_tiep) <= today
                        );
                        if (isDueForReview) {
                            finalStatus = DocumentStatus.DANG_RA_SOAT;
                        }
                    }
        
                    updatedDoc.trang_thai = finalStatus;
                    nextDocuments[docIndex] = updatedDoc;
                }
        
                return { ...prevData, versions: nextVersions, documents: nextDocuments };
            });
            addAuditLog(
                isNew ? AuditAction.CREATE : AuditAction.UPDATE,
                `${isNew ? 'Tạo' : 'Cập nhật'} phiên bản '${relatedData.phien_ban}' cho tài liệu ${relatedData.ma_tl}.`,
                'versions',
                relatedData.id_phien_ban || ''
            );
            return;
        }

        const isNewItem = !relatedData[Object.keys(relatedData).find(k => k.startsWith('id_')) || 'id'];
        handleSetData(prevData => {
            if (!prevData) return null;
            const list = (prevData as any)[type] as any[];
            const idKey = Object.keys(relatedData).find(k => k.startsWith('id_')) || 'id';
            let newList;
            if (relatedData[idKey] && list.some(item => item[idKey] === relatedData[idKey])) {
                newList = list.map(item => item[idKey] === relatedData[idKey] ? relatedData : item);
            } else {
                const newId = `${type}-${uuidv4()}`;
                const idKeyToUse = idKey in relatedData ? idKey : `id`; // Fallback to 'id' if not found
                 newList = [...list, { ...relatedData, [idKeyToUse]: relatedData[idKeyToUse] || newId }];
            }
            return { ...prevData, [type]: newList };
        });
        addAuditLog(
            isNewItem ? AuditAction.CREATE : AuditAction.UPDATE,
            `${isNewItem ? 'Tạo' : 'Cập nhật'} mục trong '${translate(type)}'.`,
            type
        );
    };

    const handleDeleteRelatedData = (type: string, relatedData: any) => {
         handleSetData(prevData => {
            if (!prevData) return null;
            const list = (prevData as any)[type] as any[];
            const idKey = Object.keys(relatedData).find(k => k.startsWith('id_')) || 'id';
            if (!idKey) return prevData;
            const newList = list.filter(item => item[idKey] !== relatedData[idKey]);
            return { ...prevData, [type]: newList };
        });
        addAuditLog(AuditAction.DELETE, `Xóa mục khỏi '${translate(type)}'.`, type);
    };
    
    const handleUpdateDocument = (updatedDocument: DanhMucTaiLieu) => {
        let originalStatus = '';
        const prevDoc = data?.documents.find(d => d.ma_tl === updatedDocument.ma_tl);
        if (prevDoc) originalStatus = prevDoc.trang_thai;

        handleSetData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                documents: prev.documents.map(d => d.ma_tl === updatedDocument.ma_tl ? updatedDocument : d),
            };
        });
        
        const details = originalStatus && originalStatus !== updatedDocument.trang_thai
            ? `Cập nhật tài liệu '${updatedDocument.ten_tai_lieu}' (${updatedDocument.ma_tl}) và thay đổi trạng thái từ '${translate(originalStatus)}' sang '${translate(updatedDocument.trang_thai)}'.`
            : `Cập nhật thông tin tài liệu '${updatedDocument.ten_tai_lieu}' (${updatedDocument.ma_tl}).`;
        addAuditLog(AuditAction.UPDATE, details, 'documents', updatedDocument.ma_tl);
    };

    const handleUpdateVersionStatus = (versionId: string, newStatus: VersionStatus) => {
        if (!data) return;
        const version = data.versions.find(v => v.id_phien_ban === versionId);
        if (version) {
            const isApproving = newStatus === VersionStatus.BAN_HANH;
            handleSaveRelatedData('versions', { ...version, trang_thai_phien_ban: newStatus, is_moi_nhat: isApproving || version.is_moi_nhat });
            addAuditLog(AuditAction.UPDATE, `Cập nhật trạng thái phiên bản '${version.phien_ban}' của tài liệu ${version.ma_tl} thành '${translate(newStatus)}'.`, 'versions', version.id_phien_ban);
        }
    };

    const handleToggleBookmark = (docId: string) => {
        handleSetData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                documents: prev.documents.map(d => 
                    d.ma_tl === docId 
                    ? { ...d, is_bookmarked: !d.is_bookmarked } 
                    : d
                ),
            };
        });
    };
    
    const handleMarkNotificationRead = (id: string) => {
        handleSetData(prev => prev ? ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, is_read: true } : n) }) : null);
    }
    
    const handleMarkAllNotificationsRead = () => {
        handleSetData(prev => prev ? ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, is_read: true })) }) : null);
    }
    
    const handleSaveCategory = (categoryKey: keyof typeof mockData, formData: any) => {
        const isNew = !formData.id;
        handleSetData(prev => {
            if (!prev) return null;
            const list = (prev as any)[categoryKey] as any[];
            let newList;
            if (formData.id && list.some(item => item.id === formData.id)) {
                 newList = list.map(item => item.id === formData.id ? formData : item);
            } else {
                 const newRole = categoryKey === 'nhanSu' ? { role: 'user' } : {};
                 newList = [...list, { ...formData, id: `${categoryKey}-${uuidv4()}`, ...newRole, is_active: true }];
            }
            return { ...prev, [categoryKey]: newList };
        });
         addAuditLog(
            isNew ? AuditAction.CREATE : AuditAction.UPDATE,
            `${isNew ? 'Tạo' : 'Cập nhật'} mục '${formData.ten}' trong '${translate(categoryKey as string)}'.`,
            categoryKey as string,
            formData.id
        );
    };

    const handleDeleteCategory = (categoryKey: keyof typeof mockData, itemToDelete: any) => {
        handleSetData(prev => {
            if (!prev) return null;
            const list = (prev as any)[categoryKey] as any[];
            const newList = list.filter(item => item.id !== itemToDelete.id);
            return { ...prev, [categoryKey]: newList };
        });
         addAuditLog(AuditAction.DELETE, `Xóa mục '${itemToDelete.ten}' khỏi '${translate(categoryKey as string)}'.`, categoryKey as string, itemToDelete.id);
    };

    const handleToggleCategoryStatus = (categoryKey: keyof typeof mockData, itemToToggle: any) => {
         handleSetData(prev => {
            if (!prev) return null;
            const list = (prev as any)[categoryKey] as any[];
            const newList = list.map(item =>
                item.id === itemToToggle.id
                    ? { ...item, is_active: item.is_active === false }
                    : item
            );
            return { ...prev, [categoryKey]: newList };
        });
        const newStatus = itemToToggle.is_active === false ? 'hoạt động' : 'vô hiệu hóa';
        addAuditLog(AuditAction.UPDATE, `Cập nhật trạng thái của '${itemToToggle.ten}' thành '${newStatus}' trong '${translate(categoryKey as string)}'.`, categoryKey as string, itemToToggle.id);
    };


    const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center space-y-4">
                <div className="spinner"></div>
                <p className="text-gray-600 animate-pulse">{message}</p>
            </div>
        </div>
    );

    if (isLoading && !currentUser) {
        // Show a more visually appealing loading state on initial app load
        return <LoadingIndicator message="Đang tải ứng dụng..." />;
    }
    
    if (error && (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('AKfycbw-C_pFUfOYtzWPqwQ1kYgP6cucA5AVe4LTcENv-89COXalBqZejq6gwsAiH96lYZoB'))) {
        return (
            <div className="flex h-screen items-center justify-center bg-red-50 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-800">Lỗi Cấu hình</h2>
                    <p className="mt-2 text-red-700">{error}</p>
                    <p className="mt-4 text-sm text-gray-600">Vui lòng làm theo hướng dẫn trong README để tạo Google Apps Script và dán URL vào file <strong>config.ts</strong>.</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }
    
    if (isLoading) {
        // Show loading indicator when refetching data after login or on manual retry
        return <LoadingIndicator message="Đang tải dữ liệu..." />;
    }

    if (error) {
         return (
            <div className="flex h-screen items-center justify-center bg-red-50 p-8">
                <div className="max-w-2xl text-center">
                    <h2 className="text-xl font-bold text-red-800">Đã xảy ra lỗi</h2>
                    <div className="mt-2 text-red-700 bg-red-100 p-4 rounded-md">{error}</div>
                    <button onClick={fetchData} className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return <div className="flex h-screen items-center justify-center">Không có dữ liệu hoặc không thể tải dữ liệu. Vui lòng kiểm tra lại Google Sheet và triển khai Apps Script.</div>;
    }
    
    const categoryManagementProps = {
        onSave: handleSaveCategory,
        onDelete: handleDeleteCategory,
        onToggleStatus: handleToggleCategoryStatus,
        currentUser: currentUser,
    };

    const renderContent = () => {
        const selectedDocument = data.documents.find(d => d.ma_tl === selectedDocId);
        switch (view) {
            case 'dashboard': return <Dashboard documents={data.documents} versions={data.versions} currentUser={currentUser} departments={data.phongBan} auditSchedules={data.auditSchedules} nhanSu={data.nhanSu} onNavigate={(view) => handleNavigate(view)} onNavigateToReport={handleNavigateToReport} onNavigateToDocument={(docId) => handleNavigate('document-detail', docId)} onNavigateToDocumentsWithFilter={handleNavigateToDocumentsWithFilter} />;
            case 'documents': return <DocumentManagementPage allData={data} onUpdateData={handleSetData} currentUser={currentUser} onViewDetails={handleViewDetails} onToggleBookmark={handleToggleBookmark} initialFilter={initialDocFilter} />;
            case 'document-detail':
                if (selectedDocument) {
                    return <DocumentDetail document={selectedDocument} allData={data} onBack={() => handleNavigate('documents')} onSaveRelatedData={handleSaveRelatedData} onDeleteRelatedData={handleDeleteRelatedData} onUpdateDocument={handleUpdateDocument} onUpdateVersionStatus={handleUpdateVersionStatus} currentUser={currentUser} onToggleBookmark={handleToggleBookmark} />;
                }
                return <div>Tài liệu không tồn tại.</div>;
            case 'settings': return <SettingsPage />;
            case 'standards': return <StandardsManagementPage standards={data.tieuChuan} onUpdateData={handleSetData} currentUser={currentUser} />;
            case 'reports': return <ReportsPage allData={data} initialReportType={initialReportType} onViewDetails={handleViewDetails} currentUser={currentUser} />;
            case 'audits': return <AuditManagementPage allData={data} onUpdateData={handleSetData} currentUser={currentUser} />;
            case 'audit-log': return <AuditLogPage auditLogs={data.auditTrail} users={data.nhanSu} />;
            
            // Category Management Pages
            case 'settings-personnel':
                return <CategoryManagementPage
                    {...categoryManagementProps} title="Quản lý Nhân sự" categoryKey="nhanSu" items={data.nhanSu}
                    FormComponent={PersonnelForm} formProps={{ phongBanList: data.phongBan, chucVuList: data.chucVu, currentUser: currentUser }}
                    columns={[
                        { header: 'Tên nhân sự', accessor: 'ten', sortKey: 'ten' },
                        { header: 'Chức vụ', accessor: (item: NhanSu) => data.chucVu.find(cv => cv.id === item.chuc_vu)?.ten || 'N/A', sortKey: 'chuc_vu' },
                        { header: 'Phòng ban', accessor: (item: NhanSu) => data.phongBan.find(pb => pb.id === item.phong_ban_id)?.ten || 'N/A', sortKey: 'phong_ban_id' },
                        { header: 'Vai trò', accessor: (item: NhanSu) => <Badge status={item.role} />, sortKey: 'role' },
                    ]}
                />;
            case 'settings-departments':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Phòng ban" categoryKey="phongBan" items={data.phongBan} FormComponent={DepartmentForm} />;
            case 'settings-positions':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Chức vụ" categoryKey="chucVu" items={data.chucVu} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Chức vụ' }} />;
            case 'settings-docTypes':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Loại tài liệu" categoryKey="loaiTaiLieu" items={data.loaiTaiLieu} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Loại tài liệu' }} />;
            case 'settings-docLevels':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Cấp độ tài liệu" categoryKey="capDoTaiLieu" items={data.capDoTaiLieu} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Cấp độ tài liệu' }} />;
            case 'settings-securityLevels':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Mức độ bảo mật" categoryKey="mucDoBaoMat" items={data.mucDoBaoMat} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Mức độ bảo mật' }} />;
            case 'settings-reviewFrequencies':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Tần suất rà soát" categoryKey="tanSuatRaSoat" items={data.tanSuatRaSoat} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Tần suất rà soát' }} />;
            case 'settings-changeItems':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Hạng mục thay đổi" categoryKey="hangMucThayDoi" items={data.hangMucThayDoi} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Hạng mục thay đổi' }} />;
            case 'settings-auditors':
                return <CategoryManagementPage 
                    {...categoryManagementProps} title="Quản lý Đánh giá viên" categoryKey="danhGiaVien" items={data.danhGiaVien}
                    FormComponent={AuditorForm} formProps={{ organizations: data.toChucDanhGia }}
                     columns={[
                        { header: 'Tên đánh giá viên', accessor: 'ten', sortKey: 'ten' },
                        { header: 'Loại', accessor: (item: DanhGiaVien) => item.loai === 'internal' ? 'Nội bộ' : 'Bên ngoài', sortKey: 'loai' },
                        { header: 'Tổ chức', accessor: (item: DanhGiaVien) => data.toChucDanhGia.find(o => o.id === item.to_chuc_id)?.ten || '', sortKey: 'to_chuc_id' },
                    ]}
                />;
            case 'settings-auditOrgs':
                return <CategoryManagementPage {...categoryManagementProps} title="Quản lý Tổ chức đánh giá" categoryKey="toChucDanhGia" items={data.toChucDanhGia} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Tổ chức đánh giá' }} />;

            default: return <div>Page not found</div>;
        }
    };

    return (
        <Layout
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={(view) => handleNavigate(view)}
            notifications={data.notifications.filter(n => n.user_id === currentUser.id)}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onNavigateToDocument={(docId) => handleNavigate('document-detail', docId)}
            currentView={view}
            onNavigateToReport={handleNavigateToReport}
            chucVuList={data.chucVu}
        >
            {renderContent()}
        </Layout>
    );
};

export default App;