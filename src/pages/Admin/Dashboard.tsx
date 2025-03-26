
import { useAuthUsers } from '../../hooks/use-auth-users';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import UsersSection from '../../components/ui/admin/UsersSection';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';

const AdminDashboard = () => {
  // Use our hook to fetch auth users
  const { users, loading, errorMsg, searchTerm, setSearchTerm } = useAuthUsers();
  
  return (
    <div className="space-y-8">
      <DashboardHeader />
      
      {/* Stats Cards */}
      <DashboardStats userCount={users.length} />
      
      {/* User List Section */}
      <UsersSection 
        users={users}
        loading={loading}
        errorMsg={errorMsg}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {/* Charts */}
      <DashboardCharts />
    </div>
  );
};

export default AdminDashboard;
