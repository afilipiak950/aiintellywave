
import { useState, useEffect } from 'react';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';
import UsersSection from '../../components/ui/admin/UsersSection';
import { useAuthUsers } from '../../hooks/use-auth-users';

const AdminDashboard = () => {
  const { users, loading, errorMsg, searchTerm, setSearchTerm, refreshUsers } = useAuthUsers();
  const [userCount, setUserCount] = useState(0);
  
  // Ensure user count is updated whenever users are loaded
  useEffect(() => {
    if (users && users.length > 0) {
      setUserCount(users.length);
      console.log(`Updated user count: ${users.length} users found`);
    }
  }, [users]);
  
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
