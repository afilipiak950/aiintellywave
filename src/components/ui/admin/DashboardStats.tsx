
import { Users, FolderKanban, BarChart, TrendingUp } from 'lucide-react';
import StatCard from '../dashboard/StatCard';

interface DashboardStatsProps {
  userCount: number;
}

const DashboardStats = ({ userCount }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Users"
        value={userCount.toString()}
        icon={<Users size={24} />}
        change={{ value: 12.5, isPositive: true }}
      />
      <StatCard
        title="Active Projects"
        value="42"
        icon={<FolderKanban size={24} />}
        change={{ value: 8.2, isPositive: true }}
      />
      <StatCard
        title="Running Campaigns"
        value="18"
        icon={<BarChart size={24} />}
        change={{ value: 4.7, isPositive: true }}
      />
      <StatCard
        title="Total Revenue"
        value="$158,430"
        icon={<TrendingUp size={24} />}
        change={{ value: 15.3, isPositive: true }}
      />
    </div>
  );
};

export default DashboardStats;
