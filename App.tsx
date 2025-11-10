import React, { useState, useEffect, useCallback, useRef } from 'react';
import { mockData } from './data/mockData';
import type { DanhMucTaiLieu, NhanSu, ThongBao, ReportType, LichRaSoat, ChucVu, AuditLog, LichAudit, DaoTaoTruyenThong, PhienBanTaiLieu } from './types';
import { DocumentStatus, NotificationType, AuditAction, VersionStatus, ReviewResult } from './constants';
import Layout from './components/layout/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DocumentManagementPage from './components/DocumentManagementPage';
import DocumentDetail from './components/DocumentDetail';
import SettingsPage from './components/SettingsPage';
import StandardsManagementPage from './components/StandardsManagementPage';
import ReportsPage from './components/ReportsPage';
import AuditManagementPage from './components/AuditManagementPage';
import { v4 as uuidv4 } from 'uuid';
import { formatDateForDisplay } from './utils/dateUtils';
import { translate } from './utils/translations';
import { GOOGLE_SCRIPT_URL } from './config';
import { getAllData, updateAllData, login } from './services/api';

type View = 'dashboard' | 'documents' | 'document-detail' | 'settings' | 'standards' | 'reports' | 'audits';

const App: React.FC = () => {
    const [data, setData] = useState<typeof mockData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);

    const [currentUser, setCurrentUser] = useState<NhanSu | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [initialReportType, setInitialReportType] = useState<ReportType | null>(null);
    
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
            const result = await getAllData();

            const parseStringToArray = (field: any): string[] => {
                if (Array.isArray(field)) return field;
                if (field && typeof field === 'string') {
                    return field.split(',').map(s => s.trim()).filter(Boolean);
                }
                return [];
            };

            const sanitizedData = {
                ...result,
                documents: result.documents.map((doc: DanhMucTaiLieu) => ({
                    ...doc,
                    pham_vi_ap_dung: parseStringToArray(doc.pham_vi_ap_dung),
                    tieu_chuan_ids: parseStringToArray(doc.tieu_chuan_ids),
                    iso_tham_chieu: parseStringToArray(doc.iso_tham_chieu),
                    tieu_chuan_khac: parseStringToArray(doc.tieu_chuan_khac),
                    phap_ly_tham_chieu: parseStringToArray(doc.phap_ly_tham_chieu),
                })),
                auditSchedules: result.auditSchedules.map((audit: LichAudit) => ({
                    ...audit,
                    tieu_chuan_ids: parseStringToArray(audit.tieu_chuan_ids),
                    doan_danh_gia_ids: parseStringToArray(audit.doan_danh_gia_ids),
                    tai_lieu_lien_quan_ids: parseStringToArray(audit.tai_lieu_lien_quan_ids),
                })),
                trainings: result.trainings.map((training: DaoTaoTruyenThong) => ({
                    ...training,
                    phong_ban_tham_gia: parseStringToArray(training.phong_ban_tham_gia),
                }))
            };

            setData(sanitizedData);
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
            setError(`Lỗi kết nối khi đồng bộ dữ liệu. Thay đổi của bạn có thể chưa được lưu. Vui lòng kiểm tra kết nối mạng.`);
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
    }, [view]);

    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        const user = await login(username, password);
        if (user) {
            await fetchData(); // Refetch all data after successful login
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
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
            return;
        }
        
        if (type === 'versions') {
            handleSetData(prevData => {
                if (!prevData) return null;

                const isNewVersion = !relatedData.id_phien_ban;
                const savedVersion = { ...relatedData };
                if (isNewVersion) {
                    savedVersion.id_phien_ban = `v-${uuidv4()}`;
                }

                let nextVersions = [...prevData.versions];

                if (savedVersion.is_moi_nhat) {
                    nextVersions = nextVersions.map(v => {
                        if (v.ma_tl !== savedVersion.ma_tl || v.id_phien_ban === savedVersion.id_phien_ban) {
                            return v;
                        }
                        const updatedV = { ...v, is_moi_nhat: false };
                        if (savedVersion.trang_thai_phien_ban === VersionStatus.BAN_HANH && v.trang_thai_phien_ban === VersionStatus.BAN_HANH) {
                            updatedV.trang_thai_phien_ban = VersionStatus.THU_HOI;
                        }
                        return updatedV;
                    });
                }

                if (isNewVersion) {
                    nextVersions.push(savedVersion);
                } else {
                    const index = nextVersions.findIndex(v => v.id_phien_ban === savedVersion.id_phien_ban);
                    if (index > -1) nextVersions[index] = savedVersion;
                    else nextVersions.push(savedVersion);
                }

                let nextDocuments = [...prevData.documents];
                const docIndex = nextDocuments.findIndex(d => d.ma_tl === savedVersion.ma_tl);
                
                if (docIndex > -1) {
                    const originalDoc = nextDocuments[docIndex];
                    let updatedDoc = { ...originalDoc };
                    
                    if (isNewVersion && originalDoc.trang_thai === DocumentStatus.DA_BAN_HANH) {
                        updatedDoc.trang_thai = DocumentStatus.DANG_RA_SOAT;
                    }
                    
                    if (savedVersion.is_moi_nhat && savedVersion.trang_thai_phien_ban === VersionStatus.BAN_HANH) {
                        updatedDoc.trang_thai = DocumentStatus.DA_BAN_HANH;
                        updatedDoc.ngay_ban_hanh = savedVersion.ngay_phat_hanh;
                        updatedDoc.ngay_hieu_luc = savedVersion.ngay_phat_hanh;
                    }
                     // If the latest version is draft/pending, the document is in review/approval
                    else if (savedVersion.is_moi_nhat && savedVersion.trang_thai_phien_ban === VersionStatus.PHE_DUYET) {
                         updatedDoc.trang_thai = DocumentStatus.CHO_PHE_DUYET;
                    } else if (savedVersion.is_moi_nhat && savedVersion.trang_thai_phien_ban === VersionStatus.BAN_THAO) {
                        if (originalDoc.trang_thai !== DocumentStatus.NHAP) {
                           updatedDoc.trang_thai = DocumentStatus.DANG_RA_SOAT;
                        }
                    }
                    
                    nextDocuments[docIndex] = updatedDoc;
                }

                return { ...prevData, versions: nextVersions, documents: nextDocuments };
            });
            return;
        }


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
    };
    
    const handleUpdateDocument = (updatedDocument: DanhMucTaiLieu) => {
        handleSetData(prev => {
            if (!prev) return null;
            const originalDoc = prev.documents.find(d => d.ma_tl === updatedDocument.ma_tl);
            let newAuditTrail = prev.auditTrail;
            if (currentUser && originalDoc && originalDoc.trang_thai !== updatedDocument.trang_thai) {
                const newAuditLog: AuditLog = {
                    id: `log-${uuidv4()}`, timestamp: new Date().toISOString(), user_id: currentUser.id,
                    action: AuditAction.UPDATE, entity_type: 'documents', entity_id: updatedDocument.ma_tl,
                    ma_tl: updatedDocument.ma_tl,
                    details: `Đã thay đổi trạng thái từ "${translate(originalDoc.trang_thai)}" sang "${translate(updatedDocument.trang_thai)}".`,
                };
                newAuditTrail = [...prev.auditTrail, newAuditLog];
            }
            return {
                ...prev,
                documents: prev.documents.map(d => d.ma_tl === updatedDocument.ma_tl ? updatedDocument : d),
                auditTrail: newAuditTrail,
            };
        });
    };

    const handleUpdateVersionStatus = (versionId: string, newStatus: VersionStatus) => {
        if (!data) return;
        const version = data.versions.find(v => v.id_phien_ban === versionId);
        if (version) {
            const isApproving = newStatus === VersionStatus.BAN_HANH;
            // When approving, this version MUST become the latest.
            handleSaveRelatedData('versions', { ...version, trang_thai_phien_ban: newStatus, is_moi_nhat: isApproving || version.is_moi_nhat });
        }
    };
    
    const handleMarkNotificationRead = (id: string) => {
        handleSetData(prev => prev ? ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, is_read: true } : n) }) : null);
    }
    
    const handleMarkAllNotificationsRead = () => {
        handleSetData(prev => prev ? ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, is_read: true })) }) : null);
    }

    if (isLoading && !currentUser) {
        return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
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
        return <div className="flex h-screen items-center justify-center">Đang tải dữ liệu...</div>;
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

    const renderContent = () => {
        const selectedDocument = data.documents.find(d => d.ma_tl === selectedDocId);
        switch (view) {
            case 'dashboard': return <Dashboard documents={data.documents} versions={data.versions} currentUser={currentUser} departments={data.phongBan} auditSchedules={data.auditSchedules} nhanSu={data.nhanSu} onNavigate={(view) => handleNavigate(view)} onNavigateToReport={handleNavigateToReport} onNavigateToDocument={(docId) => handleNavigate('document-detail', docId)} />;
            case 'documents': return <DocumentManagementPage allData={data} onUpdateData={handleSetData} currentUser={currentUser} onViewDetails={handleViewDetails} />;
            case 'document-detail':
                if (selectedDocument) {
                    return <DocumentDetail document={selectedDocument} allData={data} onBack={() => handleNavigate('documents')} onSaveRelatedData={handleSaveRelatedData} onDeleteRelatedData={handleDeleteRelatedData} onUpdateDocument={handleUpdateDocument} onUpdateVersionStatus={handleUpdateVersionStatus} currentUser={currentUser} />;
                }
                return <div>Tài liệu không tồn tại.</div>;
            case 'settings': return <SettingsPage allData={data} onUpdateData={handleSetData} currentUser={currentUser} />;
            case 'standards': return <StandardsManagementPage standards={data.tieuChuan} onUpdateData={handleSetData} currentUser={currentUser} />;
            case 'reports': return <ReportsPage allData={data} initialReportType={initialReportType} onViewDetails={handleViewDetails} />;
            case 'audits': return <AuditManagementPage allData={data} onUpdateData={handleSetData} currentUser={currentUser} />;
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