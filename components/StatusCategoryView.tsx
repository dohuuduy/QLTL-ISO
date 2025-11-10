import React from 'react';
import { 
    DocumentStatus, 
    VersionStatus,
    DistributionStatus,
    ReviewResult,
    RiskStatus,
    AuditStatus
} from '../constants';
import Badge from './ui/Badge';
import { translate } from '../utils/translations';

const StatusGroup: React.FC<{ title: string; statuses: Record<string, string> }> = ({ title, statuses }) => (
    <div>
        <h4 className="text-base font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* FIX: Explicitly type 'status' as string, as Object.values on an enum can be inferred as unknown[]. */}
            {Object.values(statuses).map((status: string) => (
                <div key={status} className="flex items-center space-x-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <Badge status={status} size="sm" />
                    <span className="text-sm text-gray-700">{translate(status)}</span>
                </div>
            ))}
        </div>
    </div>
);


const StatusCategoryView: React.FC = () => {
    const statusGroups = [
        { title: 'Trạng thái Tài liệu', statuses: DocumentStatus },
        { title: 'Trạng thái Phiên bản', statuses: VersionStatus },
        { title: 'Trạng thái Phân phối', statuses: DistributionStatus },
        { title: 'Kết quả Rà soát', statuses: ReviewResult },
        { title: 'Trạng thái Rủi ro/Cơ hội', statuses: RiskStatus },
        { title: 'Trạng thái Audit', statuses: AuditStatus },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <p className="text-sm text-gray-600">
                Đây là danh sách các trạng thái được định nghĩa sẵn trong hệ thống. Các trạng thái này không thể thay đổi từ giao diện người dùng để đảm bảo tính toàn vẹn của quy trình.
            </p>
            {statusGroups.map(group => (
                <StatusGroup key={group.title} title={group.title} statuses={group.statuses} />
            ))}
        </div>
    );
};

export default StatusCategoryView;