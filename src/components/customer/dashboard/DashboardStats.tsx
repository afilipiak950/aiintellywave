
import React from 'react';
import StatCard from '../../ui/dashboard/StatCard';
import { Users, CheckCircle, Activity, FileCheck, Database } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Project Leads"
          value={data.loading ? "..." : data.leadsCount.toString()}
          icon={<Users size={20} />}
          change={{ value: "0", isPositive: true }}
          loading={data.loading}
          description="Leads in your company projects"
        />
        <StatCard 
          title="Total Leads"
          value={data.loading ? "..." : data.totalLeadsCount.toString()}
          icon={<Database size={20} />}
          description="All leads in system (reference)"
          loading={data.loading}
        />
        <StatCard 
          title="Active Projects"
          value={data.loading ? "..." : data.activeProjects.toString()}
          icon={<Activity size={20} />}
          change={{ value: "0", isPositive: true }}
          loading={data.loading}
        />
        <StatCard 
          title="Completed Projects"
          value={data.loading ? "..." : data.completedProjects.toString()}
          icon={<CheckCircle size={20} />}
          change={{ value: "0", isPositive: true }}
          loading={data.loading}
        />
        <StatCard 
          title="Approved Candidates"
          value={data.loading ? "..." : data.approvedLeadsCount.toString()}
          icon={<FileCheck size={20} />}
          change={{ value: "0", isPositive: true }}
          loading={data.loading}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
