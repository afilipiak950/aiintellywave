
import { TrendingUp, RefreshCw } from 'lucide-react';
import { AnimatedAgents } from '../animated-agents';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const AdminOverview = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    userGrowth: "+24%",
    projectCompletion: "87%",
    systemHealth: {
      percentage: "99.8%",
      message: "All systems operational" 
    }
  });
  
  // Debug output for troubleshooting
  useEffect(() => {
    console.log('AdminOverview rendered with state:', { loading, error, refreshing });
  }, [loading, error, refreshing]);
  
  // Simulate data fetch with guaranteed success
  const fetchData = useCallback(async () => {
    console.log('Fetching AdminOverview data...');
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use stable hardcoded data
      setData({
        userGrowth: "+24%",
        projectCompletion: "87%",
        systemHealth: {
          percentage: "99.8%",
          message: "All systems operational"
        }
      });
      
      console.log('AdminOverview data fetched successfully');
    } catch (err) {
      console.error('Error in AdminOverview:', err);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleRefresh = useCallback(async () => {
    console.log('Manual refresh button clicked');
    setRefreshing(true);
    
    try {
      await fetchData();
      toast({
        title: "Dashboard refreshed",
        description: "Latest data has been loaded successfully",
      });
    } catch (err) {
      console.error('Error during refresh:', err);
      toast({
        title: "Refresh failed",
        description: "Could not load latest data. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Ensure refreshing state is reset even if there's an error
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [fetchData]);
  
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm overflow-hidden lg:col-span-2 relative p-6 h-64 transform hover:shadow-xl transition-all duration-300">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-medium">Admin Dashboard Overview</h3>
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            className="text-white hover:bg-white/10 p-2 h-8 w-8"
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh data</span>
          </Button>
        </div>
        <p className="text-blue-100 mb-4">Interactive visualization of your system activities</p>
        
        {error ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-400/30">
            <p className="text-white font-medium">Error loading live data</p>
            <p className="text-sm text-white/80 mb-2">Using cached values. Click refresh to try again.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${refreshing || loading ? 'animate-spin' : ''}`} />
              {refreshing || loading ? 'Retrying...' : 'Retry Now'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <h4 className="font-medium text-lg">User Growth</h4>
              <div className="text-3xl font-bold mt-2">{data.userGrowth}</div>
              <p className="text-sm text-blue-100 mt-1">vs. last quarter</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1" style={{ animationDelay: '0.1s' }}>
              <h4 className="font-medium text-lg">Project Completion</h4>
              <div className="text-3xl font-bold mt-2">{data.projectCompletion}</div>
              <p className="text-sm text-blue-100 mt-1">success rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-medium text-lg">System Health</h4>
              <div className="text-3xl font-bold mt-2">{data.systemHealth.percentage}</div>
              <p className="text-sm text-blue-100 mt-1">{data.systemHealth.message}</p>
            </div>
          </div>
        )}
      </div>
      <AnimatedAgents />
    </div>
  );
};

export default AdminOverview;
