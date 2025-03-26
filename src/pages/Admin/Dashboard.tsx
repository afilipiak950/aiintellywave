
import { useState, useEffect } from 'react';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';
import UsersSection from '../../components/ui/admin/UsersSection';
import { useAuthUsers } from '../../hooks/use-auth-users';

const AdminDashboard = () => {
  const { users, loading, errorMsg, searchTerm, setSearchTerm, refreshUsers } = useAuthUsers();
  const [userCount, setUserCount] = useState(0);
  
  useEffect(() => {
    setUserCount(users.length);
  }, [users]);
  
  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <DashboardStats userCount={userCount} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCharts />
      </div>
      
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
