
import { useState, useEffect } from 'react';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';
import UsersSection from '../../components/ui/admin/UsersSection';
import { useAuthUsers } from '../../hooks/use-auth-users';
import { useCustomers } from '../../hooks/use-customers';
import { Customer } from '@/hooks/customers/types';
import { toast } from '../../hooks/use-toast';
import { useRealTimeKpi } from '@/hooks/use-real-time-kpi';
import { supabase } from '@/integrations/supabase/client';
import ProjectDistributionChart from '@/components/ui/dashboard/ProjectDistributionChart';
import CompanyUsersChart from '@/components/ui/dashboard/CompanyUsersChart';
import LineChart from '@/components/ui/dashboard/LineChart';

const AdminDashboard = () => {
  const { users: authUsers, loading, errorMsg, searchTerm, setSearchTerm, refreshUsers } = useAuthUsers();
  const { customers } = useCustomers();
  const [userCount, setUserCount] = useState(0);
  const [formattedUsers, setFormattedUsers] = useState<Customer[]>([]);
  const { kpiData, loading: kpiLoading, error: kpiError, lastUpdated, refreshData } = useRealTimeKpi();
  const [monthlyLeadsData, setMonthlyLeadsData] = useState<any[]>([]);
  
  useEffect(() => {
    // Initialize data fetch
    refreshUsers();
    fetchMonthlyLeadsData();
  }, []);
  
  // Format AuthUsers to Customer type for compatibility
  useEffect(() => {
    if (authUsers && authUsers.length > 0) {
      const formatted: Customer[] = authUsers.map(user => ({
        id: user.id,
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        status: 'active', // Default status since AuthUser might not have this
        user_id: user.id, // Add user_id to identify this as a user, not a company
        role: user.user_metadata?.role,
        avatar_url: user.avatar_url
      }));
      
      setFormattedUsers(formatted);
      
      if (userCount === 0) {
        setUserCount(formatted.length);
        console.log(`Updated user count from auth users: ${formatted.length} users found`);
      }
    }
  }, [authUsers, userCount]);
  
  // Update userCount from customers (more reliable data source)
  useEffect(() => {
    if (customers && customers.length > 0) {
      // Only count actual users, not companies
      const userCustomers = customers.filter(c => c.user_id);
      setUserCount(userCustomers.length);
      console.log(`Updated user count from customers: ${userCustomers.length} users found`);
    }
  }, [customers]);
  
  // Fetch monthly leads data for timeline chart
  const fetchMonthlyLeadsData = async () => {
    try {
      // Generate data for last 12 months
      const monthsData = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleString('default', { month: 'short' });
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();
        
        // Get leads count for this month
        const { count: leadsCount, error: leadsError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);
          
        if (leadsError) throw leadsError;
        
        // Get projects created this month
        const { count: projectsCount, error: projectsError } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);
          
        if (projectsError) throw projectsError;
        
        // Get users created this month
        const { count: usersCount, error: usersError } = await supabase
          .from('company_users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);
          
        if (usersError) throw usersError;
        
        monthsData.push({
          name: monthName,
          leads: leadsCount || 0,
          projects: projectsCount || 0,
          users: usersCount || 0
        });
      }
      
      setMonthlyLeadsData(monthsData);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      
      // Set fallback data
      const fallbackData = [
        { name: 'May', leads: 50, projects: 5, users: 2 },
        { name: 'Jun', leads: 65, projects: 7, users: 3 },
        { name: 'Jul', leads: 80, projects: 8, users: 2 },
        { name: 'Aug', leads: 95, projects: 10, users: 4 },
        { name: 'Sep', leads: 110, projects: 12, users: 5 },
        { name: 'Oct', leads: 125, projects: 15, users: 4 },
        { name: 'Nov', leads: 140, projects: 16, users: 6 },
        { name: 'Dec', leads: 150, projects: 18, users: 7 },
        { name: 'Jan', leads: 165, projects: 20, users: 5 },
        { name: 'Feb', leads: 180, projects: 22, users: 8 },
        { name: 'Mar', leads: 195, projects: 25, users: 10 },
        { name: 'Apr', leads: 210, projects: 28, users: 12 },
      ];
      
      setMonthlyLeadsData(fallbackData);
    }
  };
  
  // Set up real-time updates for monthly data
  useEffect(() => {
    const leadsChannel = supabase.channel('admin:leads-monthly')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        console.log('Leads data changed, refreshing monthly chart');
        fetchMonthlyLeadsData();
      })
      .subscribe();
      
    const projectsChannel = supabase.channel('admin:projects-monthly')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        console.log('Projects data changed, refreshing monthly chart');
        fetchMonthlyLeadsData();
      })
      .subscribe();
      
    const usersChannel = supabase.channel('admin:users-monthly')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_users' }, () => {
        console.log('Users data changed, refreshing monthly chart');
        fetchMonthlyLeadsData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader />
      
      <DashboardStats userCount={userCount} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LineChart 
          data={monthlyLeadsData}
          dataKeys={['leads', 'projects', 'users']}
          title="Growth Overview (Last 12 Months)"
          subtitle="Monthly leads, projects, and users"
        />
        <ProjectDistributionChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <CompanyUsersChart />
      </div>
      
      <UsersSection 
        users={formattedUsers}
        loading={loading}
        errorMsg={errorMsg}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        refreshUsers={refreshUsers}
      />
      
      <div className="text-xs text-gray-500 text-right">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AdminDashboard;
