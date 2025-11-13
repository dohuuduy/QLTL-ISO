import React from 'react';
import Skeleton from './ui/Skeleton';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Title Skeleton */}
            <Skeleton className="h-9 w-1/3" />

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 space-y-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
                <div className="xl:col-span-2">
                    <Skeleton className="h-96" />
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
