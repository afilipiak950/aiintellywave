
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../hooks/use-toast';
import ManagerDashboardHeader from '../../components/ui/manager/ManagerDashboardHeader';
import ManagerDashboardStats from '../../components/ui/manager/ManagerDashboardStats';
import ManagerDashboardCharts from '../../components/ui/manager/ManagerDashboardCharts';
import ManagerDashboardLoading from '../../components/ui/manager/ManagerDashboardLoading';

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

  // Mock data for the chart
  const projectData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 6 },
    { name: 'Mar', count: 8 },
    { name: 'Apr', count: 10 },
    { name: 'May', count: 7 },
    { name: 'Jun', count: 9 },
  ];

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (user?.companyId) {
        try {
          console.log("Fetching company data for company ID:", user.companyId);
          setLoading(true);
          
          // Fetch company details
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('id', user.companyId)
            .maybeSingle();
            
          if (companyError) {
            console.error('Error fetching company data:', companyError);
            toast({
              title: "Error",
              description: "Failed to load company data.",
              variant: "destructive"
            });
          } else if (companyData) {
            console.log("Company data fetched:", companyData.name);
            setCompanyName(companyData.name);
          } else {
            console.log("No company data found for ID:", user.companyId);
          }
          
          // Fetch customer count
          const { count: customerCount, error: customerError } = await supabase
            .from('company_users')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', user.companyId)
            .eq('role', 'customer');
            
          if (customerError) {
            console.error('Error fetching customer count:', customerError);
          } else {
            console.log("Customer count fetched:", customerCount);
          }
            
          // Fetch project stats
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id, status')
            .eq('company_id', user.companyId);
            
          if (projectsError) {
            console.error('Error fetching project data:', projectsError);
          } else if (projectsData) {
            console.log("Projects data fetched, count:", projectsData.length);
            
            const activeProjects = projectsData.filter(p => 
              ['planning', 'in_progress'].includes(p.status)).length;
            const completedProjects = projectsData.filter(p => 
              p.status === 'completed').length;
              
            console.log("Active projects:", activeProjects);
            console.log("Completed projects:", completedProjects);
              
            setStats({
              customers: customerCount || 0,
              projects: projectsData.length,
              activeProjects,
              completedProjects,
            });
          } else {
            console.log("No projects data found");
          }
        } catch (error) {
          console.error('Error in fetchCompanyData:', error);
          toast({
            title: "Error",
            description: "Failed to load dashboard data.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No company ID found for user");
        setLoading(false);
      }
    };
    
    if (user) {
      console.log("User is authenticated, fetching company data");
      fetchCompanyData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <ManagerDashboardLoading />;
  }

  return (
    <div className="space-y-6">
      <ManagerDashboardHeader companyName={companyName} />
      <ManagerDashboardStats stats={stats} />
      <ManagerDashboardCharts projectData={projectData} />
    </div>
  );
};

export default ManagerDashboard;
