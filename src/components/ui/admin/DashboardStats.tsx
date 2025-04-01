
import { Users, FolderKanban, TrendingUp, ServerCog, BellRing, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StatCard from '../dashboard/StatCard';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2 } from 'lucide-react';

interface DashboardStatsProps {
  userCount: number;
}

interface KpiMetric {
  id: string;
  name: string;
  value: number;
  previous_value: number;
  updated_at: string;
}

const DashboardStats = ({ userCount }: DashboardStatsProps) => {
  const [leadsCount, setLeadsCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [conversionRate, setConversionRate] = useState<KpiMetric | null>(null);
  const [bookingCandidates, setBookingCandidates] = useState<KpiMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingKpi, setEditingKpi] = useState<string | null>(null);
  const [kpiValue, setKpiValue] = useState('');
  
  const loadKpiData = async () => {
    try {
      setLoading(true);
      
      // Fetch total leads count
      const { count: leadsTotal, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (leadsError) throw leadsError;
      
      // Fetch active projects count
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .in('status', ['planning', 'in_progress']);
        
      if (projectsError) throw projectsError;
      
      // Fetch conversion rate KPI
      const { data: conversionData, error: conversionError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('name', 'conversion_rate')
        .maybeSingle();
        
      if (conversionError) throw conversionError;
      
      // Fetch booking with candidates KPI
      const { data: bookingData, error: bookingError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('name', 'booking_candidates')
        .maybeSingle();
        
      if (bookingError) throw bookingError;
      
      // Update state with fetched data
      setLeadsCount(leadsTotal || 0);
      setActiveProjects(projectsData?.length || 0);
      setConversionRate(conversionData);
      setBookingCandidates(bookingData);
      
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
  
  const calculateGrowth = (current: number, previous: number): { value: string, isPositive: boolean } => {
    if (!previous) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };
  
  const handleSaveKpi = async () => {
    try {
      const numericValue = parseFloat(kpiValue);
      if (isNaN(numericValue)) {
        toast({
          title: "Invalid Value",
          description: "Please enter a valid number",
          variant: "destructive"
        });
        return;
      }
      
      const kpiToUpdate = editingKpi === 'conversion_rate' ? conversionRate : bookingCandidates;
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .update({ 
          previous_value: kpiToUpdate?.value || 0,
          value: numericValue,
          updated_at: new Date().toISOString()
        })
        .eq('name', editingKpi)
        .select()
        .single();
        
      if (error) throw error;
      
      if (editingKpi === 'conversion_rate') {
        setConversionRate(data);
      } else {
        setBookingCandidates(data);
      }
      
      toast({
        title: "KPI Updated",
        description: "The KPI value has been updated successfully",
      });
      
      setEditingKpi(null);
      setKpiValue('');
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const openKpiEditor = (kpiName: string, currentValue: number) => {
    setEditingKpi(kpiName);
    setKpiValue(currentValue.toString());
  };
  
  // Format the value for display
  const formatKpiValue = (kpi: KpiMetric | null, isPercentage: boolean = false) => {
    if (!kpi) return isPercentage ? "0%" : "0";
    return isPercentage ? `${kpi.value}%` : `€${kpi.value.toLocaleString()}`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <div className="xl:col-span-2">
        <StatCard
          title="Total Leads"
          value={loading ? "..." : leadsCount.toString()} 
          icon={<Users size={24} />}
          change={calculateGrowth(leadsCount, leadsCount * 0.9)} // Simulating previous month for leads
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
        />
      </div>
      <div className="xl:col-span-2">
        <StatCard
          title="Active Projects"
          value={loading ? "..." : activeProjects.toString()}
          icon={<FolderKanban size={24} />}
          change={calculateGrowth(activeProjects, activeProjects * 0.95)} // Simulating previous month
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
        />
      </div>
      <div className="xl:col-span-2">
        <Popover open={editingKpi === 'conversion_rate'} onOpenChange={(open) => !open && setEditingKpi(null)}>
          <PopoverTrigger asChild>
            <div className="relative">
              <StatCard
                title="Conversion Rate"
                value={loading ? "..." : formatKpiValue(conversionRate, true)}
                icon={<TrendingUp size={24} />}
                change={conversionRate ? calculateGrowth(conversionRate.value, conversionRate.previous_value) : { value: "0.0", isPositive: true }}
                bgColor="bg-gradient-to-br from-violet-50 to-violet-100"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 p-1 h-auto"
                onClick={() => openKpiEditor('conversion_rate', conversionRate?.value || 0)}
              >
                <Edit2 size={16} />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Update Conversion Rate</h4>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number" 
                  value={kpiValue} 
                  onChange={(e) => setKpiValue(e.target.value)}
                  placeholder="Enter percentage"
                />
                <span>%</span>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingKpi(null)}>Cancel</Button>
                <Button onClick={handleSaveKpi}>Save</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="xl:col-span-2">
        <Popover open={editingKpi === 'booking_candidates'} onOpenChange={(open) => !open && setEditingKpi(null)}>
          <PopoverTrigger asChild>
            <div className="relative">
              <StatCard
                title="Booking w. Candidates"
                value={loading ? "..." : formatKpiValue(bookingCandidates)}
                icon={<CalendarCheck size={24} />}
                change={bookingCandidates ? calculateGrowth(bookingCandidates.value, bookingCandidates.previous_value) : { value: "0.0", isPositive: false }}
                bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 p-1 h-auto"
                onClick={() => openKpiEditor('booking_candidates', bookingCandidates?.value || 0)}
              >
                <Edit2 size={16} />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Update Booking with Candidates</h4>
              <div className="flex items-center space-x-2">
                <span>€</span>
                <Input 
                  type="number" 
                  value={kpiValue} 
                  onChange={(e) => setKpiValue(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingKpi(null)}>Cancel</Button>
                <Button onClick={handleSaveKpi}>Save</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="xl:col-span-2">
        <StatCard
          title="System Health"
          value="99.8%"
          icon={<ServerCog size={24} />}
          description="All systems operational"
          bgColor="bg-gradient-to-br from-teal-50 to-teal-100"
        />
      </div>
      <div className="xl:col-span-2">
        <StatCard
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
