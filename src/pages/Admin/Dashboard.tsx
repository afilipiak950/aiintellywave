
import { useState, useEffect } from 'react';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';
import UsersSection from '../../components/ui/admin/UsersSection';
import { useAuthUsers } from '../../hooks/use-auth-users';
import { useCustomers } from '../../hooks/use-customers';
import { toast } from '../../hooks/use-toast';

const AdminDashboard = () => {
  const { users, loading, errorMsg, searchTerm, setSearchTerm, refreshUsers } = useAuthUsers();
  const { customers } = useCustomers();
  const [userCount, setUserCount] = useState(0);
  
  useEffect(() => {
    // Initialize data fetch
    refreshUsers();
  }, []);
  
  // Update userCount from customers (more reliable data source)
  useEffect(() => {
    if (customers && customers.length > 0) {
      setUserCount(customers.length);
      console.log(`Updated user count from customers: ${customers.length} users found`);
    }
  }, [customers]);
  
  // Fallback to auth users if available
  useEffect(() => {
    if (userCount === 0 && users && users.length > 0) {
      setUserCount(users.length);
      console.log(`Updated user count from auth users: ${users.length} users found`);
    }
  }, [users, userCount]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader />
      
      <DashboardStats userCount={userCount} />
      
      <DashboardCharts />
      
      <UsersSection 
        users={users}
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
