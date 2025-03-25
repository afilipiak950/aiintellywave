
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { UserRound, FolderKanban, BarChart, Users } from 'lucide-react';

interface DashboardStats {
  employeeCount: number;
  projectCount: number;
  campaignCount: number;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    employeeCount: 0,
    projectCount: 0,
    campaignCount: 0
  });
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    const fetchManagerCompany = async () => {
      if (!user) return;
      
      try {
        // Get the company this user is a manager of
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id, companies:company_id(name)')
          .eq('user_id', user.id)
          .eq('is_admin', true)
          .single();
        
        if (error) throw error;
        
        if (data && data.company_id) {
          setCompanyId(data.company_id);
          if (data.companies && data.companies.name) {
            setCompanyName(data.companies.name);
          }
          fetchDashboardStats(data.company_id);
        }
      } catch (error) {
        console.error('Error fetching manager company:', error);
        setLoading(false);
      }
    };
    
    fetchManagerCompany();
  }, [user]);

  const fetchDashboardStats = async (companyId: string) => {
    try {
      setLoading(true);
      
      // Get employee count
      const { data: employeeData, error: employeeError } = await supabase
        .from('company_users')
        .select('count', { count: 'exact' })
        .eq('company_id', companyId);
      
      if (employeeError) throw employeeError;
      
      // Get project count
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('count', { count: 'exact' })
        .eq('company_id', companyId);
      
      if (projectError) throw projectError;
      
      // Get campaign count
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('count', { count: 'exact' })
        .filter('project_id', 'in', `(
          select id from projects where company_id = '${companyId}'
        )`);
      
      if (campaignError) throw campaignError;
      
      setStats({
        employeeCount: employeeData.length || 0,
        projectCount: projectData.length || 0,
        campaignCount: campaignData.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <p className="text-gray-600">{companyName} Overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <UserRound className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employeeCount}</div>
            <p className="text-xs text-gray-500">Company employees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectCount}</div>
            <p className="text-xs text-gray-500">Active projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campaignCount}</div>
            <p className="text-xs text-gray-500">Marketing campaigns</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Add more dashboard content here - recent activity, employee list, etc. */}
    </div>
  );
};

export default ManagerDashboard;
