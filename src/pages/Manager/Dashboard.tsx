import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import StatCard from '../../components/ui/dashboard/StatCard';
import LineChart from '../../components/ui/dashboard/LineChart';
import { Users, FolderKanban, Calendar, CheckSquare } from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState({
    customers: 0,
    projects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (user?.companyId) {
        // Fetch company details
        const { data: companyData } = await supabase
          .from('companies')
          .select('name')
          .eq('id', user.companyId)
          .single();
          
        if (companyData) {
          setCompanyName(companyData.name);
        }
        
        // Fetch customer count
        const { count: customerCount } = await supabase
          .from('company_users')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', user.companyId)
          .eq('role', 'customer');
          
        // Fetch project stats
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, status')
          .eq('company_id', user.companyId);
          
        if (projectsData) {
          const activeProjects = projectsData.filter(p => 
            ['planning', 'in_progress'].includes(p.status)).length;
          const completedProjects = projectsData.filter(p => 
            p.status === 'completed').length;
            
          setStats({
            customers: customerCount || 0,
            projects: projectsData.length,
            activeProjects,
            completedProjects,
          });
        }
      }
    };
    
    fetchCompanyData();
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
          description="Total customers in your company" 
          trend={{ value: '12%', positive: true }}
        />
        <StatCard 
          title="Projects" 
          value={stats.projects.toString()} 
          icon={<FolderKanban className="h-5 w-5" />}
          description="Total projects" 
          trend={{ value: '5%', positive: true }}
        />
        <StatCard 
          title="Active Projects" 
          value={stats.activeProjects.toString()} 
          icon={<Calendar className="h-5 w-5" />}
          description="Projects in progress" 
          trend={{ value: '3%', positive: true }}
        />
        <StatCard 
          title="Completed Projects" 
          value={stats.completedProjects.toString()} 
          icon={<CheckSquare className="h-5 w-5" />}
          description="Successful deliveries" 
          trend={{ value: '7%', positive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-medium mb-4">Project Activity</h2>
          <div className="h-80">
            <LineChart 
              data={projectData} 
              dataKey="count" 
              nameKey="name" 
              fill="#4f46e5" 
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
