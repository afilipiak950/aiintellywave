
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/auth';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../hooks/use-toast';
import ManagerDashboardHeader from '../../components/ui/manager/ManagerDashboardHeader';
import ManagerDashboardStats from '../../components/ui/manager/ManagerDashboardStats';
import ManagerDashboardCharts from '../../components/ui/manager/ManagerDashboardCharts';
import ManagerDashboardLoading from '../../components/ui/manager/ManagerDashboardLoading';
import ManagerCustomerMetrics from '../../components/ui/manager/ManagerCustomerMetrics';

// Define interfaces for the data types
interface CompanyData {
  name: string;
  [key: string]: any; // For any other properties
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState({
    customers: 0,
    projects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data for the chart - would be replaced with real data in a production app
  const projectData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 6 },
    { name: 'Mar', count: 8 },
    { name: 'Apr', count: 10 },
    { name: 'May', count: 7 },
    { name: 'Jun', count: 9 },
  ];

  // Memoize fetch function to prevent recreation on each render
  const fetchCompanyData = useCallback(async () => {
    if (user?.companyId) {
      try {
        console.log("Fetching company data for company ID:", user.companyId);
        setLoading(true);
        setError(null);
        
        // Use Promise.allSettled to handle partial failures
        const promises = [
          // Fetch company details - fixed to use maybeSingle() to get a single object not an array
          supabase
            .from('companies')
            .select('name')
            .eq('id', user.companyId)
            .maybeSingle(),
            
          // Fetch customer count  
          supabase
            .from('company_users')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', user.companyId)
            .eq('role', 'customer'),
            
          // Fetch project stats  
          supabase
            .from('projects')
            .select('id, status')
            .eq('company_id', user.companyId)
        ];
        
        const [companyResult, customerResult, projectsResult] = await Promise.allSettled(promises);
        
        // Process company data result
        if (companyResult.status === 'fulfilled') {
          const { data: companyData, error: companyError } = companyResult.value;
          
          if (companyError) {
            console.warn('Error fetching company data:', companyError);
          } else if (companyData) {
            // Explicitly handle the company data with proper type assertion
            const typedCompanyData = companyData as CompanyData;
            setCompanyName(typedCompanyData.name || '');
          }
        }
        
        // Process customer count result
        let customerCount = 0;
        if (customerResult.status === 'fulfilled') {
          const { count, error: customerError } = customerResult.value;
          
          if (customerError) {
            console.warn('Error fetching customer count:', customerError);
          } else {
            customerCount = count || 0;
          }
        }
        
        // Process projects data result
        let projectsData: any[] = [];
        if (projectsResult.status === 'fulfilled') {
          const { data, error: projectsError } = projectsResult.value;
          
          if (projectsError) {
            console.warn('Error fetching project data:', projectsError);
          } else if (data && Array.isArray(data)) {
            projectsData = data;
          }
        }
        
        // Process and update statistics
        const activeProjects = projectsData.filter(p => 
          ['planning', 'in_progress'].includes(p.status)).length;
        const completedProjects = projectsData.filter(p => 
          p.status === 'completed').length;
          
        setStats({
          customers: customerCount,
          projects: projectsData.length,
          activeProjects,
          completedProjects,
        });
        
        setLastUpdated(new Date());
        
      } catch (error) {
        console.error('Error in fetchCompanyData:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No company ID found for user");
      setLoading(false);
      setError('No company associated with user account');
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchCompanyData();
    } else {
      setLoading(false);
    }
    // Only run when user changes, not on every render
  }, [user, fetchCompanyData]);

  // Handle refresh action
  const handleRefresh = () => {
    fetchCompanyData();
  };

  if (loading) {
    return <ManagerDashboardLoading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-3">Dashboard Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagerDashboardHeader companyName={companyName} />
      <div>
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-lg font-semibold">Dashboard Statistics</h2>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        <ManagerDashboardStats stats={stats} loading={loading} />
      </div>
      
      {/* Add company metrics section */}
      {user?.companyId && (
        <ManagerCustomerMetrics companyId={user.companyId} />
      )}
      
      <ManagerDashboardCharts projectData={projectData} />
      <div className="text-sm text-gray-500 text-right">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ManagerDashboard;
