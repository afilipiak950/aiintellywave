
import React, { Suspense } from 'react';
import { useRealTimeKpi } from '@/hooks/use-real-time-kpi';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import { Card } from '@/components/ui/card';
import StatCard from '@/components/ui/dashboard/StatCard';
import { Users, CheckCircle, Activity, FileCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import CustomerDashboardCharts from '@/components/ui/customer/DashboardCharts';

const Statistics = () => {
  const { t } = useTranslation();
  const { kpiData, loading, error, lastUpdated, refreshData } = useRealTimeKpi();

  return (
    <LeadDatabaseContainer>
      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-3 items-center">
            <h2 className="text-xl font-semibold">{t('statistics')}</h2>
            <button 
              onClick={refreshData}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Leads"
              value={loading ? "..." : kpiData.leadsCount.toString()}
              icon={<Users size={20} />}
              change={{ value: "0", isPositive: true }}
              loading={loading}
            />
            <StatCard 
              title="Active Projects"
              value={loading ? "..." : kpiData.activeProjects.toString()}
              icon={<Activity size={20} />}
              change={{ value: "0", isPositive: true }}
              loading={loading}
            />
            <StatCard 
              title="Completed Projects"
              value={loading ? "..." : kpiData.completedProjects.toString()}
              icon={<CheckCircle size={20} />}
              change={{ value: "0", isPositive: true }}
              loading={loading}
            />
            <StatCard 
              title="System Health"
              value={loading ? "..." : kpiData.systemHealth.percentage}
              icon={<FileCheck size={20} />}
              description={kpiData.systemHealth.message}
              loading={loading}
            />
          </div>
        </div>
        
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
        
        <div className="text-sm text-gray-500 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </LeadDatabaseContainer>
  );
};

export default Statistics;
