
import { Users, FolderKanban, BarChart, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StatCard from '../dashboard/StatCard';
import { toast } from '@/hooks/use-toast';

interface DashboardStatsProps {
  userCount: number;
}

const DashboardStats = ({ userCount }: DashboardStatsProps) => {
  const [projectCount, setProjectCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch active projects count
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .neq('status', 'completed')
          .neq('status', 'canceled');
          
        if (projectsError) throw projectsError;
        
        // Fetch active campaigns count
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('status', 'active');
          
        if (campaignsError) throw campaignsError;
        
        // Fetch revenue from campaign statistics (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: revenueData, error: revenueError } = await supabase
          .from('campaign_statistics')
          .select('revenue')
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
          
        if (revenueError) throw revenueError;
        
        // Set the data
        setProjectCount(projectsData?.length || 0);
        setCampaignCount(campaignsData?.length || 0);
        
        // Calculate total revenue
        const revenue = revenueData?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;
        setTotalRevenue(revenue);
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

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
        value={loading ? "..." : projectCount.toString()}
        icon={<FolderKanban size={24} />}
        change={{ value: 8.2, isPositive: true }}
      />
      <StatCard
        title="Running Campaigns"
        value={loading ? "..." : campaignCount.toString()}
        icon={<BarChart size={24} />}
        change={{ value: 4.7, isPositive: true }}
      />
      <StatCard
        title="Total Revenue"
        value={loading ? "..." : `$${totalRevenue.toLocaleString()}`}
        icon={<TrendingUp size={24} />}
        change={{ value: 15.3, isPositive: true }}
      />
    </div>
  );
};

export default DashboardStats;
