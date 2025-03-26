
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import LineChart from '../dashboard/LineChart';

const DashboardCharts = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Get the last 12 months
        const months = [];
        const today = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(today.getMonth() - i);
          months.push({
            name: d.toLocaleString('default', { month: 'short' }),
            year: d.getFullYear(),
            month: d.getMonth() + 1
          });
        }
        
        // Fetch revenue data by month
        const { data: revenueStats, error: revenueError } = await supabase
          .from('campaign_statistics')
          .select('date, revenue');
          
        if (revenueError) throw revenueError;
        
        // Fetch campaign data
        const { data: campaignStats, error: campaignError } = await supabase
          .from('campaign_statistics')
          .select('date, campaign_id, impressions, clicks, conversions');
          
        if (campaignError) throw campaignError;
        
        // Get campaign names
        const { data: campaigns, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name');
          
        if (campaignsError) throw campaignsError;
        
        // Format revenue data by month
        const revenueByMonth = months.map(month => {
          const monthStr = `${month.year}-${month.month.toString().padStart(2, '0')}`;
          const monthRevenue = revenueStats
            ?.filter(item => item.date.startsWith(monthStr))
            .reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;
            
          return {
            name: month.name,
            revenue: monthRevenue
          };
        });
        
        // Create campaign performance data
        const campaignMap = campaigns?.reduce((acc, campaign) => {
          acc[campaign.id] = campaign.name;
          return acc;
        }, {} as Record<string, string>) || {};
        
        // Get top 3 campaigns by impressions
        const topCampaignIds = Object.entries(
          campaignStats?.reduce((acc, stat) => {
            if (!acc[stat.campaign_id]) acc[stat.campaign_id] = 0;
            acc[stat.campaign_id] += stat.impressions || 0;
            return acc;
          }, {} as Record<string, number>) || {}
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id);
        
        // Format campaign data
        const campaignMonthlyData = months.map(month => {
          const monthStr = `${month.year}-${month.month.toString().padStart(2, '0')}`;
          
          const result: any = { name: month.name };
          
          // Add data for each top campaign
          topCampaignIds.forEach((campaignId, index) => {
            const campaignName = campaignMap[campaignId] || `Campaign ${index + 1}`;
            const campaignKey = `campaign${index + 1}`;
            
            const monthlyStats = campaignStats
              ?.filter(item => item.date.startsWith(monthStr) && item.campaign_id === campaignId)
              .reduce((sum, item) => sum + (item.impressions || 0), 0) || 0;
              
            result[campaignKey] = monthlyStats;
          });
          
          return result;
        });
        
        setRevenueData(revenueByMonth);
        setCampaignData(campaignMonthlyData);
      } catch (error: any) {
        console.error('Error fetching chart data:', error);
        toast({
          title: "Error",
          description: "Failed to load chart data",
          variant: "destructive"
        });
        
        // Fallback to some default data
        setRevenueData(generateFallbackRevenueData());
        setCampaignData(generateFallbackCampaignData());
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, []);
  
  // Fallback data generators for error cases
  const generateFallbackRevenueData = () => {
    return [
      { name: 'Jan', revenue: 4000 },
      { name: 'Feb', revenue: 5000 },
      { name: 'Mar', revenue: 3000 },
      { name: 'Apr', revenue: 7000 },
      { name: 'May', revenue: 5000 },
      { name: 'Jun', revenue: 8000 },
      { name: 'Jul', revenue: 10000 },
      { name: 'Aug', revenue: 12000 },
      { name: 'Sep', revenue: 9000 },
      { name: 'Oct', revenue: 11000 },
      { name: 'Nov', revenue: 14000 },
      { name: 'Dec', revenue: 16000 },
    ];
  };
  
  const generateFallbackCampaignData = () => {
    return [
      { name: 'Jan', campaign1: 2400, campaign2: 1800, campaign3: 3200 },
      { name: 'Feb', campaign1: 1900, campaign2: 2700, campaign3: 2900 },
      { name: 'Mar', campaign1: 3000, campaign2: 2000, campaign3: 2400 },
      { name: 'Apr', campaign1: 2800, campaign2: 2300, campaign3: 3100 },
      { name: 'May', campaign1: 3500, campaign2: 2600, campaign3: 3300 },
      { name: 'Jun', campaign1: 3700, campaign2: 3100, campaign3: 3700 },
    ];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LineChart
        data={revenueData}
        dataKeys={['revenue']}
        colors={['#3b82f6']}
        title="Revenue Overview"
        subtitle="Monthly revenue for the current year"
      />
      <LineChart
        data={campaignData}
        dataKeys={['campaign1', 'campaign2', 'campaign3']}
        title="Campaign Performance"
        subtitle="Performance metrics for top 3 campaigns"
      />
    </div>
  );
};

export default DashboardCharts;
