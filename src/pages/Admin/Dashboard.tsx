
import { useState, useEffect } from 'react';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';
import UsersSection from '../../components/ui/admin/UsersSection';
import { useAuthUsers } from '../../hooks/use-auth-users';
import { useCustomers } from '../../hooks/use-customers';
import { Customer } from '@/hooks/customers/types';
import { toast } from '../../hooks/use-toast';

const AdminDashboard = () => {
  const { users: authUsers, loading, errorMsg, searchTerm, setSearchTerm, refreshUsers } = useAuthUsers();
  const { customers } = useCustomers();
  const [userCount, setUserCount] = useState(0);
  const [formattedUsers, setFormattedUsers] = useState<Customer[]>([]);
  
  useEffect(() => {
    // Initialize data fetch
    refreshUsers();
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
        role: user.role || user.user_metadata?.role,
        avatar: user.avatar_url
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader />
      
      <DashboardStats userCount={userCount} />
      
      <DashboardCharts />
      
      <UsersSection 
        users={formattedUsers}
        loading={loading}
        errorMsg={errorMsg}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        refreshUsers={refreshUsers}
      />
    </div>
  );
};

export default AdminDashboard;
