
import { TrendingUp, RefreshCw } from 'lucide-react';
import { AnimatedAgents } from '../animated-agents';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRealTimeKpi } from '@/hooks/use-real-time-kpi';

const AdminOverview = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { kpiData, loading, error, refreshData } = useRealTimeKpi();
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 500);
  };
  
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm overflow-hidden lg:col-span-2 relative p-6 h-64 transform hover:shadow-xl transition-all duration-300">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-medium">Admin Dashboard Overview</h3>
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            className="text-white hover:bg-white/10 p-2 h-8 w-8"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh data</span>
          </Button>
        </div>
        <p className="text-blue-100 mb-4">Interactive visualization of your system activities</p>
        
        {error ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-400/30">
            <p className="text-white font-medium">Error loading live data</p>
            <p className="text-sm text-white/80 mb-2">Using cached values. Click refresh to try again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <h4 className="font-medium text-lg">User Growth</h4>
              <div className="text-3xl font-bold mt-2">+24%</div>
              <p className="text-sm text-blue-100 mt-1">vs. last quarter</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1" style={{ animationDelay: '0.1s' }}>
              <h4 className="font-medium text-lg">Project Completion</h4>
              <div className="text-3xl font-bold mt-2">87%</div>
              <p className="text-sm text-blue-100 mt-1">success rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-medium text-lg">System Health</h4>
              <div className="text-3xl font-bold mt-2">{kpiData.systemHealth.percentage}</div>
              <p className="text-sm text-blue-100 mt-1">{kpiData.systemHealth.message}</p>
            </div>
          </div>
        )}
      </div>
      <AnimatedAgents />
    </div>
  );
};

export default AdminOverview;
