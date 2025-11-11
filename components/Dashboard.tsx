import React, { useMemo } from 'react';
import type { DanhMucTaiLieu, NhanSu, PhongBan, PhienBanTaiLieu, LichAudit, ReportType } from '../types';
import KpiDashboard from './KpiDashboard';
import DashboardInsights from './DashboardInsights';
import ActionableDocuments from './ActionableDocuments';
import UpcomingAudits from './UpcomingAudits';
import ExpiringDocuments from './ExpiringDocuments';
import BookmarkedDocuments from './BookmarkedDocuments';

interface DashboardProps {
    documents: DanhMucTaiLieu[];
    versions: PhienBanTaiLieu[];
    currentUser: NhanSu;
    departments: PhongBan[];
    auditSchedules: LichAudit[];
    nhanSu: NhanSu[];
    onNavigate: (view: 'audits') => void;
    onNavigateToReport: (reportType: ReportType) => void;
    onNavigateToDocument: (docId: string) => void;
    onNavigateToDocumentsWithFilter: (filter: 'bookmarked') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    documents, versions, currentUser, departments, 
    auditSchedules, nhanSu, onNavigate, onNavigateToReport, onNavigateToDocument, 
    onNavigateToDocumentsWithFilter 
}) => {
    
    const nhanSuMap = useMemo(() => new Map(nhanSu.filter(Boolean).map(ns => [ns.id, ns.ten])), [nhanSu]);

    // FIX: Wrapper function to handle document clicks and pass the ID to the navigator.
    const handleDocumentClick = (doc: DanhMucTaiLieu) => {
        onNavigateToDocument(doc.ma_tl);
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Dashboard</h1>
            
            {/* KPI cards in a horizontal row */}
            <KpiDashboard documents={documents} />

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 space-y-6">
                     <ActionableDocuments 
                        documents={documents} 
                        versions={versions}
                        currentUser={currentUser} 
                        onDocumentClick={handleDocumentClick}
                    />
                     <BookmarkedDocuments
                        documents={documents}
                        onDocumentClick={handleDocumentClick}
                        onNavigateToDocuments={() => onNavigateToDocumentsWithFilter('bookmarked')}
                    />
                     <ExpiringDocuments
                        documents={documents}
                        onDocumentClick={handleDocumentClick}
                        onNavigateToReport={onNavigateToReport}
                    />
                     <UpcomingAudits
                        schedules={auditSchedules}
                        nhanSuMap={nhanSuMap}
                        onNavigate={() => onNavigate('audits')}
                    />
                </div>
                <div className="xl:col-span-2">
                     <DashboardInsights documents={documents} departments={departments} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;