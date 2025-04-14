
import React, { Suspense } from 'react';
import { useRealTimeKpi } from '@/hooks/use-real-time-kpi';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import { useTranslation } from '@/hooks/useTranslation';
import CustomerDashboardCharts from '@/components/ui/customer/DashboardCharts';

const Statistics = () => {
  const { t } = useTranslation();
  const { kpiData, loading, error, lastUpdated, refreshData } = useRealTimeKpi();

  return (
    <LeadDatabaseContainer>
      <div className="space-y-8">
        <div className="mb-6">
          <Suspense fallback={<div className="h-60 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
            <CustomerDashboardCharts />
          </Suspense>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </LeadDatabaseContainer>
  );
};

export default React.memo(Statistics);
