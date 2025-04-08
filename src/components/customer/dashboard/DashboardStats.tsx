import React from 'react';
import StatCard from '../../ui/dashboard/StatCard';
import { Users, CheckCircle, Activity, FileCheck } from 'lucide-react';
import { DashboardData } from '@/hooks/use-dashboard-data';

interface DashboardStatsProps {
  data: DashboardData;
  onRefresh: () => void;
  t: (key: string) => string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, onRefresh, t }) => {
  return (
    <div>
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-xl font-semibold">{t('statistics')}</h2>
        <button 
          onClick={onRefresh}
          disabled={data.loading}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {data.loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      {/* Statistics have been removed */}
    </div>
  );
};

export default DashboardStats;
