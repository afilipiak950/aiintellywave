
import React from 'react';
import { BarChart, Users, FolderKanban, CheckSquare } from 'lucide-react';
import StatCard from '@/components/ui/dashboard/StatCard';

interface KPIStatCardsProps {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  metrics: any;
  kpisLoading: boolean;
}

const KPIStatCards = ({
  totalUsers,
  totalProjects,
  activeProjects,
  completedProjects,
  metrics,
  kpisLoading
}: KPIStatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Team Members" 
        value={kpisLoading ? "..." : totalUsers.toString()} 
        icon={<Users className="h-5 w-5" />}
        loading={kpisLoading}
        change={metrics['team_members'] ? { 
          value: '0', 
          isPositive: true 
        } : undefined}
      />
      <StatCard 
        title="Total Projects" 
        value={kpisLoading ? "..." : totalProjects.toString()} 
        icon={<FolderKanban className="h-5 w-5" />}
        loading={kpisLoading}
        change={metrics['projects_count'] ? { 
          value: '0', 
          isPositive: true 
        } : undefined}
      />
      <StatCard 
        title="Active Projects" 
        value={kpisLoading ? "..." : activeProjects.toString()} 
        icon={<BarChart className="h-5 w-5" />}
        loading={kpisLoading}
        change={metrics['active_projects'] ? { 
          value: '0', 
          isPositive: true 
        } : undefined}
      />
      <StatCard 
        title="Completed Projects" 
        value={kpisLoading ? "..." : completedProjects.toString()} 
        icon={<CheckSquare className="h-5 w-5" />}
        loading={kpisLoading}
        change={metrics['completed_projects'] ? { 
          value: '0', 
          isPositive: true 
        } : undefined}
      />
    </div>
  );
};

export default KPIStatCards;
