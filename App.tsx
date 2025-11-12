
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Import Types
import type { 
    NhanSu,
    DanhMucTaiLieu,
    ReportType,
    DanhMucChung,
    LichRaSoat
} from './types';
import { VersionStatus } from './constants';

// Import Services & Data
import { login, getAllData, updateAllData } from './services/api';
import { mockData } from './data/mockData';

// Import Components
import Layout from './components/layout/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DocumentManagementPage from './components/DocumentManagementPage';
import DocumentDetail from './components/DocumentDetail';
import StandardsManagementPage from './components/StandardsManagementPage';
import AuditManagementPage from './components/AuditManagementPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import CategoryManagementPage from './components/CategoryManagementPage';
import AuditLogPage from './components/AuditLogPage';
import PersonnelForm from './components/forms/PersonnelForm';
import DepartmentForm from './components/forms/DepartmentForm';
import GenericCategoryForm from './components/forms/GenericCategoryForm';
import AuditorForm from './components/forms/AuditorForm';
// FIX: Import the Badge component.
import Badge from './components/ui/Badge';

// Define View states
type View =
    | { type: 'dashboard' }
    | { type: 'documents'; filter: string | null }
    | { type: 'documentDetail'; docId: string }
    | { type: 'standards' }
    | { type: 'audits' }
    | { type: 'reports'; reportType: ReportType | null }
    | { type: 'audit-log' }
    | { type: 'settings' }
    | { type: 'settings-personnel' }
    | { type: 'settings-departments' }
    | { type: 'settings-positions' }
    | { type: 'settings-docTypes' }
    | { type: 'settings-docLevels' }
    | { type: 'settings-securityLevels' }
    | { type: 'settings-reviewFrequencies' }
    | { type: 'settings-changeItems' }
    | { type: 'settings-auditors' }
    | { type: 'settings-auditOrgs' };

type AppData = typeof mockData;

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<NhanSu | null>(null);
    const [appData, setAppData] = useState<AppData>(mockData);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<View>({ type: 'dashboard' });
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await getAllData();
                setAppData(data);
                setError(null);
            } catch (e) {
                console.error("Failed to load data, using mock data.", e);
                setError("Không thể tải dữ liệu từ máy chủ. Đang sử dụng dữ liệu mẫu.");
                setAppData(mockData);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

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
                    setError("Lỗi: Không thể lưu thay đổi vào máy chủ.");
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
            return <div className="flex items-center justify-center h-screen">Đang tải dữ liệu...</div>;
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

            case 'standards':
                return <StandardsManagementPage standards={appData.tieuChuan} onUpdateData={setAppData} currentUser={currentUser!} />;
            
            case 'audits':
                 return <AuditManagementPage allData={appData} onUpdateData={setAppData} currentUser={currentUser!} />;
            
            case 'reports':
                return <ReportsPage allData={appData} initialReportType={(view as {type: 'reports', reportType: ReportType | null}).reportType} onViewDetails={(doc) => handleNavigateToDocument(doc.ma_tl)} currentUser={currentUser!} />;

            case 'audit-log':
                return <AuditLogPage auditLogs={appData.auditTrail} users={appData.nhanSu} />;

            case 'settings':
                return <SettingsPage />;
            
            case 'settings-personnel':
                return <CategoryManagementPage
                    title="Quản lý Nhân sự"
                    categoryKey="nhanSu"
                    items={appData.nhanSu}
                    columns={[
                        { header: 'Tên nhân sự', accessor: 'ten', sortKey: 'ten' },
                        { header: 'Tên đăng nhập', accessor: 'ten_dang_nhap', sortKey: 'ten_dang_nhap' },
                        { header: 'Chức vụ', accessor: (item: NhanSu) => appData.chucVu.find(cv => cv.id === item.chuc_vu)?.ten || '', sortKey: 'chuc_vu' },
                        { header: 'Phòng ban', accessor: (item: NhanSu) => appData.phongBan.find(pb => pb.id === item.phong_ban_id)?.ten || '', sortKey: 'phong_ban_id' },
                        { header: 'Vai trò', accessor: (item: NhanSu) => <Badge status={item.role} />, sortKey: 'role' },
                    ]}
                    FormComponent={PersonnelForm}
                    formProps={{ phongBanList: appData.phongBan, chucVuList: appData.chucVu, currentUser: currentUser! }}
                    onSave={handleSaveCategory}
                    onDelete={handleDeleteCategory}
                    onToggleStatus={handleToggleCategoryStatus}
                    currentUser={currentUser!}
                />;
            
            case 'settings-departments':
                 return <CategoryManagementPage<DanhMucChung> title="Quản lý Phòng ban" categoryKey="phongBan" items={appData.phongBan} FormComponent={DepartmentForm} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-positions':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Chức vụ" categoryKey="chucVu" items={appData.chucVu} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Chức vụ' }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-docTypes':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Loại tài liệu" categoryKey="loaiTaiLieu" items={appData.loaiTaiLieu} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Loại tài liệu' }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-docLevels':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Cấp độ tài liệu" categoryKey="capDoTaiLieu" items={appData.capDoTaiLieu} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Cấp độ tài liệu' }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-securityLevels':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Mức độ bảo mật" categoryKey="mucDoBaoMat" items={appData.mucDoBaoMat} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Mức độ bảo mật' }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-reviewFrequencies':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Tần suất rà soát" categoryKey="tanSuatRaSoat" items={appData.tanSuatRaSoat} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Tần suất rà soát' }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-changeItems':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Hạng mục thay đổi" categoryKey="hangMucThayDoi" items={appData.hangMucThayDoi} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Hạng mục thay đổi' }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-auditors':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Đánh giá viên" categoryKey="danhGiaVien" items={appData.danhGiaVien} FormComponent={AuditorForm} formProps={{ organizations: appData.toChucDanhGia }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;
            case 'settings-auditOrgs':
                return <CategoryManagementPage<DanhMucChung> title="Quản lý Tổ chức đánh giá" categoryKey="toChucDanhGia" items={appData.toChucDanhGia} FormComponent={GenericCategoryForm} formProps={{ categoryName: 'Tổ chức đánh giá' }} onSave={handleSaveCategory} onDelete={handleDeleteCategory} onToggleStatus={handleToggleCategoryStatus} currentUser={currentUser!} />;

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
