
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import StatCard from '../../components/ui/dashboard/StatCard';
import LineChart from '../../components/ui/dashboard/LineChart';
import { Users, FolderKanban, Calendar, CheckSquare } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

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
  
  // Mock data for the chart
  const projectData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 6 },
    { name: 'Mar', count: 8 },
    { name: 'Apr', count: 10 },
    { name: 'May', count: 7 },
    { name: 'Jun', count: 9 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        {companyName && (
          <p className="text-gray-500">Managing {companyName}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Team Members" 
          value={stats.customers.toString()} 
          icon={<Users className="h-5 w-5" />}
          trend={{ value: '12%', positive: true }}
        />
        <StatCard 
          title="Projects" 
          value={stats.projects.toString()} 
          icon={<FolderKanban className="h-5 w-5" />}
          trend={{ value: '5%', positive: true }}
        />
        <StatCard 
          title="Active Projects" 
          value={stats.activeProjects.toString()} 
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: '3%', positive: true }}
        />
        <StatCard 
          title="Completed Projects" 
          value={stats.completedProjects.toString()} 
          icon={<CheckSquare className="h-5 w-5" />}
          trend={{ value: '7%', positive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-medium mb-4">Project Activity</h2>
          <div className="h-80">
            <LineChart 
              data={projectData}
              dataKeys={['count']} 
              title="Project Activity"
              subtitle="Monthly project count"
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-3 flex items-start">
                <span className="bg-blue-100 text-blue-800 p-2 rounded-full mr-3">
                  <Users size={16} />
                </span>
                <div>
                  <p className="font-medium">New customer added</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
