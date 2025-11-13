import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Import Types
import type { 
    NhanSu,
    DanhMucTaiLieu,
    ReportType,
    DanhMucChung,
    LichRaSoat,
    ThongBao
} from './types';
import { VersionStatus, DocumentStatus, NotificationType } from './constants';

// Import Services & Data
import { login, getAllData, updateAllData } from './services/api';
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
                const data = await getAllData();
                setAppData(data);
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
            today.setHours(0, 0, 0, 0);

            const REVIEW_DUE_DAYS = 7;
            const EXPIRY_APPROACHING_DAYS = 30;

            const reviewDueDateThreshold = new Date(today);
            reviewDueDateThreshold.setDate(today.getDate() + REVIEW_DUE_DAYS);

            const expiryDateThreshold = new Date(today);
            expiryDateThreshold.setDate(today.getDate() + EXPIRY_APPROACHING_DAYS);

            const existingNotificationKeys = new Set(
                appData.notifications.map(n => `${n.ma_tl}_${n.type}`)
            );
            
            // 1. Check for expired and expiring documents
            appData.documents.forEach(doc => {
                if (doc.ngay_het_hieu_luc) {
                    const expiryDate = new Date(doc.ngay_het_hieu_luc);
                    expiryDate.setHours(0, 0, 0, 0);

                    // Expired documents
                    if (expiryDate < today && doc.trang_thai !== DocumentStatus.HET_HIEU_LUC) {
                        documentsToUpdate.push({ ...doc, trang_thai: DocumentStatus.HET_HIEU_LUC });
                        
                        const notificationKey = `${doc.ma_tl}_${NotificationType.DOCUMENT_EXPIRED}`;
                        if (!existingNotificationKeys.has(notificationKey)) {
                            const userIdsToNotify = new Set([doc.nguoi_soan_thao, doc.nguoi_ra_soat, doc.nguoi_phe_duyet]);
                            userIdsToNotify.forEach(userId => {
                                if (userId) {
                                    newNotifications.push({
                                        id: `notif-${uuidv4()}`,
                                        user_id: userId,
                                        ma_tl: doc.ma_tl,
                                        type: NotificationType.DOCUMENT_EXPIRED,
                                        message: `Tài liệu "${doc.ten_tai_lieu}" đã hết hiệu lực.`,
                                        timestamp: new Date().toISOString(),
                                        is_read: false
                                    });
                                }
                            });
                            existingNotificationKeys.add(notificationKey);
                        }
                    } 
                    // Expiring documents
                    else if (expiryDate >= today && expiryDate <= expiryDateThreshold && doc.trang_thai !== DocumentStatus.HET_HIEU_LUC) {
                        const notificationKey = `${doc.ma_tl}_${NotificationType.EXPIRY_APPROACHING}`;
                        if (!existingNotificationKeys.has(notificationKey)) {
                            const userIdsToNotify = new Set([doc.nguoi_soan_thao, doc.nguoi_ra_soat, doc.nguoi_phe_duyet]);
                            userIdsToNotify.forEach(userId => {
                                if (userId) {
                                    newNotifications.push({
                                        id: `notif-${uuidv4()}`,
                                        user_id: userId,
                                        ma_tl: doc.ma_tl,
                                        type: NotificationType.EXPIRY_APPROACHING,
                                        message: `Tài liệu "${doc.ten_tai_lieu}" sắp hết hiệu lực vào ngày ${expiryDate.toLocaleDateString('vi-VN')}.`,
                                        timestamp: new Date().toISOString(),
                                        is_read: false
                                    });
                                }
                            });
                            existingNotificationKeys.add(notificationKey);
                        }
                    }
                }
            });

            // 2. Check for due and overdue reviews
            appData.reviewSchedules.forEach(schedule => {
                const doc = appData.documents.find(d => d.ma_tl === schedule.ma_tl);
                if (!doc || schedule.ket_qua_ra_soat) return;

                const nextReviewDate = new Date(schedule.ngay_ra_soat_ke_tiep);
                nextReviewDate.setHours(0, 0, 0, 0);

                // Overdue reviews
                if (nextReviewDate < today) {
                    if (doc.trang_thai === DocumentStatus.DA_BAN_HANH) {
                         documentsToUpdate.push({ ...doc, trang_thai: DocumentStatus.DANG_RA_SOAT });
                    }
                    const notificationKey = `${doc.ma_tl}_${NotificationType.REVIEW_OVERDUE}`;
                    if (!existingNotificationKeys.has(notificationKey)) {
                        newNotifications.push({
                            id: `notif-${uuidv4()}`,
                            user_id: schedule.nguoi_chiu_trach_nhiem,
                            ma_tl: doc.ma_tl,
                            type: NotificationType.REVIEW_OVERDUE,
                            message: `Tài liệu "${doc.ten_tai_lieu}" đã quá hạn rà soát.`,
                            timestamp: new Date().toISOString(),
                            is_read: false
                        });
                        existingNotificationKeys.add(notificationKey);
                    }
                }
                // Reviews due soon
                else if (nextReviewDate >= today && nextReviewDate <= reviewDueDateThreshold) {
                    const notificationKey = `${doc.ma_tl}_${NotificationType.REVIEW_DUE}`;
                     if (!existingNotificationKeys.has(notificationKey)) {
                        newNotifications.push({
                            id: `notif-${uuidv4()}`,
                            user_id: schedule.nguoi_chiu_trach_nhiem,
                            ma_tl: doc.ma_tl,
                            type: NotificationType.REVIEW_DUE,
                            message: `Tài liệu "${doc.ten_tai_lieu}" sắp đến hạn rà soát.`,
                            timestamp: new Date().toISOString(),
                            is_read: false
                        });
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
    }, [isLoading, currentUser, appData.notifications, appData.documents, appData.reviewSchedules]);


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
            const newVersions = prev.versions.map(v => v.id_phien_ban === versionId ? { ...v, trang_thai_phien_ban: newStatus } : v);
            return { ...prev, versions: newVersions };
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
                    const nextReviewDate = new Date(data.ngay_ra_soat_thuc_te);
                    nextReviewDate.setMonth(nextReviewDate.getMonth() + tanSuat.so_thang);
                    const newSchedule: LichRaSoat = {
                        id_lich: `rs-${uuidv4()}`,
                        ma_tl: oldSchedule!.ma_tl,
                        tan_suat: oldSchedule!.tan_suat,
                        ngay_ra_soat_ke_tiep: nextReviewDate.toISOString().split('T')[0],
                        nguoi_chiu_trach_nhiem: oldSchedule!.nguoi_chiu_trach_nhiem,
                    };
                    newList.push(newSchedule);
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
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <div className="spinner"></div>
                        <span className="text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                </div>
            );
        }

        if (error && appData.documents.length === 0) {
            return (
                <div className="flex items-center justify-center h-full p-4">
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