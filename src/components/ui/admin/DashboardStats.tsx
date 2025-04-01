
import { Users, FolderKanban, TrendingUp, ServerCog, BellRing, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '@/services/kpi-service';
import { toast } from '@/hooks/use-toast';
import { useDashboardKpi, KpiMetric } from '@/hooks/use-dashboard-kpi';
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
      
      const stats = await fetchDashboardStats();
      
      // Update state with fetched data
      setLeadsCount(stats.leadsCount);
      setActiveProjects(stats.activeProjects);
      
      // Set conversion rate
      if (stats.conversionRate) {
        setConversionRate({
          id: 'conversion_rate',
          name: 'conversion_rate',
          value: stats.conversionRate.value,
          previous_value: stats.conversionRate.previousValue,
          updated_at: new Date().toISOString()
        });
      }
      
      // Set booking candidates
      if (stats.bookingCandidates) {
        setBookingCandidates({
          id: 'booking_candidates',
          name: 'booking_candidates',
          value: stats.bookingCandidates.value,
          previous_value: stats.bookingCandidates.previousValue,
          updated_at: new Date().toISOString()
        });
      }
      
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
          loading={loading}
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
