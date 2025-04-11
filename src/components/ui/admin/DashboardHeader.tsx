
import { Clock, TrendingUp, UserPlus, FolderPlus, RefreshCw, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/use-projects';
import { useCustomers } from '@/hooks/use-customers';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DashboardHeader = () => {
  const { fetchProjects } = useProjects();
  const { refetch: fetchCustomers } = useCustomers();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleGenerateReport = () => {
    // Refresh data when generating report
    fetchProjects();
    fetchCustomers();
    
    toast({
      title: "Report Generated",
      description: "The system report has been generated successfully.",
    });
  };

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      
      // Refresh all dashboard data
      await Promise.all([
        fetchProjects(), 
        fetchCustomers(),
        // Publish a custom event to trigger KPI refresh
        supabase.channel('public').send({
          type: 'broadcast',
          event: 'dashboard-refresh',
          payload: { timestamp: new Date().toISOString() }
        })
      ]);
      
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, monitor and manage your system</p>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <button className="btn-secondary bg-white shadow-sm border flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Clock size={16} className="text-gray-500" />
            <span>Last 30 Days</span>
          </button>
          
          <button 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white shadow-sm ${isRefreshing ? 'opacity-70' : 'hover:bg-gray-50'}`}
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={`text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/customers/new" className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 inline-flex items-center gap-1.5 text-sm font-medium">
            <UserPlus size={16} className="text-gray-500" />
            <span>New Customer</span>
          </Link>
          
          <Link to="/admin/projects/new" className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 inline-flex items-center gap-1.5 text-sm font-medium">
            <FolderPlus size={16} className="text-gray-500" />
            <span>New Project</span>
          </Link>
          
          <button 
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors" 
            onClick={handleGenerateReport}
          >
            <Download size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
