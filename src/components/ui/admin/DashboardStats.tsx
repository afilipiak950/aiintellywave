
import { Users, FolderKanban, ServerCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useDashboardKpi, KpiMetric } from '@/hooks/use-dashboard-kpi';
import { useAggregatedMetrics } from '@/hooks/use-aggregated-metrics';
import KpiEditableCard from './KpiEditableCard';
import KpiSimpleCard from './KpiSimpleCard';

interface DashboardStatsProps {
  userCount: number;
}

const DashboardStats = ({ userCount }: DashboardStatsProps) => {
  const [leadsCount, setLeadsCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch aggregated metrics from customer_metrics table
  const {
    metrics: aggregatedMetrics,
    loading: metricsLoading
  } = useAggregatedMetrics();
  
  const {
    editingKpi,
    kpiValue,
    setKpiValue,
    openKpiEditor,
    handleSaveKpi,
    setEditingKpi
  } = useDashboardKpi();

  const loadKpiData = async () => {
    try {
      setLoading(true);
      
      // Simulate fetching data from an API
      // Replace this with your actual data fetching logic
      setTimeout(() => {
        setLeadsCount(150);
        setActiveProjects(35);
        setLoading(false);
      }, 1000);
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
  
  useEffect(() => {
    loadKpiData();
  }, []);
  
  // Calculate growth percentage for non-KPI metrics
  const calculateGrowth = (current: number, previous: number): { value: string, isPositive: boolean } => {
    if (!previous) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };
  
  const isDataLoading = loading || metricsLoading;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <div className="xl:col-span-2">
        <KpiSimpleCard
          title="Total Leads"
          value={leadsCount.toString()}
          icon={<Users size={24} />}
          change={calculateGrowth(leadsCount, leadsCount * 0.9)}
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          loading={loading}
        />
      </div>
      <div className="xl:col-span-2">
        <KpiSimpleCard
          title="Active Projects"
          value={activeProjects.toString()}
          icon={<FolderKanban size={24} />}
          change={calculateGrowth(activeProjects, activeProjects * 0.95)}
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          loading={loading}
        />
      </div>
      <div className="xl:col-span-2">
        <KpiSimpleCard
          title="System Health"
          value="99.8%"
          icon={<ServerCog size={24} />}
          description="All systems operational"
          bgColor="bg-gradient-to-br from-teal-50 to-teal-100"
        />
      </div>
    </div>
  );
};

export default DashboardStats;
