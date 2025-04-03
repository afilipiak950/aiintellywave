import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/auth';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../hooks/use-toast';
import ManagerDashboardHeader from '../../components/ui/manager/ManagerDashboardHeader';
import ManagerDashboardStats from '../../components/ui/manager/ManagerDashboardStats';
import ManagerDashboardCharts from '../../components/ui/manager/ManagerDashboardCharts';
import ManagerDashboardLoading from '../../components/ui/manager/ManagerDashboardLoading';
import ManagerCustomerMetrics from '../../components/ui/manager/ManagerCustomerMetrics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Define interfaces for the data types
interface CompanyData {
  name: string;
  [key: string]: any; // For any other properties
}

interface DashboardStats {
  customers: number;
  projects: number;
  activeProjects: number;
  completedProjects: number;
}

// Add a status field to company_users for type safety
interface CompanyUser {
  avatar_url: string; 
  company_id: string;
  created_at: string;
  created_at_auth: string;
  email: string; 
  first_name: string;
  full_name: string;
  id: string; 
  is_admin: boolean;
  is_manager_kpi_enabled: boolean;
  last_name: string;
  last_sign_in_at: string;
  role: string;
  user_id: string;
  status?: string; // Add optional status field
}

const fetchDashboardData = async (companyId: string | undefined) => {
  if (!companyId) {
    throw new Error('No company ID found for user');
  }

  console.log("Fetching dashboard data for company ID:", companyId);
  
  // Use Promise.allSettled to handle partial failures
  const promises = [
    // Fetch company details - fixed to use maybeSingle() to get a single object not an array
    supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .maybeSingle(),
      
    // Fetch customer count  
    supabase
      .from('company_users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('role', 'customer'),
      
    // Fetch project stats  
    supabase
      .from('projects')
      .select('id, status')
      .eq('company_id', companyId)
  ];
  
  const [companyResult, customerResult, projectsResult] = await Promise.allSettled(promises);
  
  // Initialize return object with default values
  const result: { companyName: string; stats: DashboardStats } = {
    companyName: '',
    stats: { customers: 0, projects: 0, activeProjects: 0, completedProjects: 0 }
  };
  
  // Process company data result
  if (companyResult.status === 'fulfilled') {
    const { data: companyData, error: companyError } = companyResult.value;
    
    if (companyError) {
      console.warn('Error fetching company data:', companyError);
    } else if (companyData) {
      // Explicitly handle the company data with proper type assertion
      const typedCompanyData = companyData as CompanyData;
      result.companyName = typedCompanyData.name || '';
    }
  }
  
  // Process customer count result
  if (customerResult.status === 'fulfilled') {
    const { count, error: customerError } = customerResult.value;
    
    if (customerError) {
      console.warn('Error fetching customer count:', customerError);
    } else {
      result.stats.customers = count || 0;
    }
  }
  
  // Process projects data result
  if (projectsResult.status === 'fulfilled') {
    const { data, error: projectsError } = projectsResult.value;
    
    if (projectsError) {
      console.warn('Error fetching project data:', projectsError);
    } else if (data && Array.isArray(data)) {
      result.stats.projects = data.length;
      result.stats.activeProjects = data.filter(p => 
        ['planning', 'in_progress'].includes(p.status)).length;
      result.stats.completedProjects = data.filter(p => 
        p.status === 'completed').length;
    }
  }
  
  return result;
};

const setupDashboardSubscription = (companyId: string | undefined, queryClient: any) => {
  if (!companyId) return () => {};
  
  console.log('[setupDashboardSubscription] Setting up realtime subscription for company dashboard:', companyId);
  
  // Subscribe to projects changes
  const projectsChannel = supabase.channel(`public:projects:company_id=eq.${companyId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'projects',
      filter: `company_id=eq.${companyId}`
    }, (payload) => {
      console.log('[setupDashboardSubscription] Project update received:', payload);
      queryClient.invalidateQueries({ queryKey: ['dashboard', companyId] });
    })
    .subscribe();
    
  // Subscribe to company_users changes
  const companyUsersChannel = supabase.channel(`public:company_users:company_id=eq.${companyId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'company_users',
      filter: `company_id=eq.${companyId}`
    }, (payload) => {
      console.log('[setupDashboardSubscription] Company users update received:', payload);
      queryClient.invalidateQueries({ queryKey: ['dashboard', companyId] });
    })
    .subscribe();
    
  // Return cleanup function
  return () => {
    console.log('[setupDashboardSubscription] Cleaning up dashboard subscriptions');
    supabase.removeChannel(projectsChannel);
    supabase.removeChannel(companyUsersChannel);
  };
};

// Mock data for the chart - would be replaced with real data in a production app
const projectData = [
  { name: 'Jan', count: 4 },
  { name: 'Feb', count: 6 },
  { name: 'Mar', count: 8 },
  { name: 'Apr', count: 10 },
  { name: 'May', count: 7 },
  { name: 'Jun', count: 9 },
];

const DashboardContainer = () => {
  const { user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  
  // Use React Query to fetch and cache dashboard data
  const { 
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', user?.companyId],
    queryFn: () => fetchDashboardData(user?.companyId),
    enabled: !!user?.companyId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
    meta: {
      onSuccess: () => {
        setLastUpdated(new Date());
      }
    }
  });
  
  // Destructure data with defaults
  const { companyName = '', stats = { customers: 0, projects: 0, activeProjects: 0, completedProjects: 0 } } = data || {};
  
  // Set up realtime subscription
  useEffect(() => {
    const cleanup = setupDashboardSubscription(user?.companyId, queryClient);
    return cleanup;
  }, [user?.companyId, queryClient]);

  // Handle refresh action with animation
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Dashboard",
      description: "Dashboard data is being updated...",
    });
  };

  if (loading && !data) {
    return <ManagerDashboardLoading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-3">Dashboard Error</h2>
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Failed to load dashboard data'}
        </p>
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
    <AnimatePresence mode="wait">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ManagerDashboardHeader companyName={companyName} />
        <div>
          <div className="flex justify-between mb-3 items-center">
            <h2 className="text-lg font-semibold">Dashboard Statistics</h2>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1"></span>
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
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
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardContainer;
