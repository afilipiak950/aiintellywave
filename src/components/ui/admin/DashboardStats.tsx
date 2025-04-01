import { Users, FolderKanban, TrendingUp, ServerCog, BellRing, CalendarCheck } from 'lucide-react';
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
  const [conversionRate, setConversionRate] = useState<KpiMetric | null>(null);
  const [bookingCandidates, setBookingCandidates] = useState<KpiMetric | null>(null);
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
        setConversionRate({
          id: 'conversion_rate',
          name: 'conversion_rate',
          value: 25.5,
          previous_value: 22.0,
          updated_at: new Date().toISOString()
        });
        setBookingCandidates({
          id: 'booking_candidates',
          name: 'booking_candidates',
          value: 12500,
          previous_value: 11000,
          updated_at: new Date().toISOString()
        });
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
  
  useEffect(() => {
    // Update KPI metrics based on the aggregated data
    if (aggregatedMetrics && !metricsLoading) {
      setConversionRate(prevState => ({
        id: 'conversion_rate',
        name: 'conversion_rate',
        value: aggregatedMetrics.avg_conversion_rate,
        previous_value: prevState?.previous_value || 0,
        updated_at: new Date().toISOString()
      }));
      
      setBookingCandidates(prevState => ({
        id: 'booking_candidates',
        name: 'booking_candidates',
        value: aggregatedMetrics.total_booking_candidates,
        previous_value: prevState?.previous_value || 0,
        updated_at: new Date().toISOString()
      }));
    }
  }, [aggregatedMetrics, metricsLoading]);
  
  // Calculate growth percentage for non-KPI metrics
  const calculateGrowth = (current: number, previous: number): { value: string, isPositive: boolean } => {
    if (!previous) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };
  
  const handleSaveConversionRate = async () => {
    const updatedKpi = await handleSaveKpi(conversionRate);
    if (updatedKpi) {
      setConversionRate(updatedKpi);
    }
  };
  
  const handleSaveBookingCandidates = async () => {
    const updatedKpi = await handleSaveKpi(bookingCandidates);
    if (updatedKpi) {
      setBookingCandidates(updatedKpi);
    }
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
        <KpiEditableCard
          title="Conversion Rate"
          kpi={conversionRate}
          icon={<TrendingUp size={24} />}
          isPercentage={true}
          bgColor="bg-gradient-to-br from-violet-50 to-violet-100"
          isEditing={editingKpi === 'conversion_rate'}
          kpiValue={kpiValue}
          onEdit={openKpiEditor}
          onSave={handleSaveConversionRate}
          onCancel={() => setEditingKpi(null)}
          setKpiValue={setKpiValue}
          loading={isDataLoading}
        />
      </div>
      <div className="xl:col-span-2">
        <KpiEditableCard
          title="Booking w. Candidates"
          kpi={bookingCandidates}
          icon={<CalendarCheck size={24} />}
          bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
          isEditing={editingKpi === 'booking_candidates'}
          kpiValue={kpiValue}
          onEdit={openKpiEditor}
          onSave={handleSaveBookingCandidates}
          onCancel={() => setEditingKpi(null)}
          setKpiValue={setKpiValue}
          loading={isDataLoading}
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
      <div className="xl:col-span-2">
        <KpiSimpleCard
          title="System Alerts"
          value={(Math.floor(Math.random() * 5)).toString()}
          icon={<BellRing size={24} />}
          description="Alerts requiring attention"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
        />
      </div>
    </div>
  );
};

export default DashboardStats;
