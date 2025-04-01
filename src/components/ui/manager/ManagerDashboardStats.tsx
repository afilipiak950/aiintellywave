
import React from 'react';
import StatCard from '../dashboard/StatCard';
import { Users, FolderKanban, Calendar, CheckSquare } from 'lucide-react';

interface StatsData {
  customers: number;
  projects: number;
  activeProjects: number;
  completedProjects: number;
}

interface ManagerDashboardStatsProps {
  stats: StatsData;
}

const ManagerDashboardStats = ({ stats }: ManagerDashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Team Members" 
        value={stats.customers.toString()} 
        icon={<Users className="h-5 w-5" />}
        change={{ value: '12', isPositive: true }}
      />
      <StatCard 
        title="Projects" 
        value={stats.projects.toString()} 
        icon={<FolderKanban className="h-5 w-5" />}
        change={{ value: '5', isPositive: true }}
      />
      <StatCard 
        title="Active Projects" 
        value={stats.activeProjects.toString()} 
        icon={<Calendar className="h-5 w-5" />}
        change={{ value: '3', isPositive: true }}
      />
      <StatCard 
        title="Completed Projects" 
        value={stats.completedProjects.toString()} 
        icon={<CheckSquare className="h-5 w-5" />}
        change={{ value: '7', isPositive: true }}
      />
    </div>
  );
};

export default ManagerDashboardStats;
