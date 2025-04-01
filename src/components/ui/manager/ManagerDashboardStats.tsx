
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
  loading?: boolean;
}

const ManagerDashboardStats = ({ stats, loading = false }: ManagerDashboardStatsProps) => {
  // Helper to calculate growth percentage
  const calculateGrowth = (current: number, previous: number): { value: string, isPositive: boolean } => {
    if (!previous) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Team Members" 
        value={loading ? "..." : stats.customers.toString()} 
        icon={<Users className="h-5 w-5" />}
        change={{ value: '12', isPositive: true }}
      />
      <StatCard 
        title="Projects" 
        value={loading ? "..." : stats.projects.toString()} 
        icon={<FolderKanban className="h-5 w-5" />}
        change={calculateGrowth(stats.projects, stats.projects * 0.95)}
      />
      <StatCard 
        title="Active Projects" 
        value={loading ? "..." : stats.activeProjects.toString()} 
        icon={<Calendar className="h-5 w-5" />}
        change={calculateGrowth(stats.activeProjects, stats.activeProjects * 0.97)}
      />
      <StatCard 
        title="Completed Projects" 
        value={loading ? "..." : stats.completedProjects.toString()} 
        icon={<CheckSquare className="h-5 w-5" />}
        change={calculateGrowth(stats.completedProjects, stats.completedProjects * 0.9)}
      />
    </div>
  );
};

export default ManagerDashboardStats;
