
import { useState } from 'react';
import { Users, FolderKanban, BarChart, TrendingUp, Clock, Search } from 'lucide-react';
import StatCard from '../../components/ui/dashboard/StatCard';
import LineChart from '../../components/ui/dashboard/LineChart';
import UserTable from '../../components/ui/user/UserTable';
import UserLoadingState from '../../components/ui/user/UserLoadingState';
import { useAuthUsers } from '../../hooks/use-auth-users';

const AdminDashboard = () => {
  // Use our hook to fetch auth users
  const { users, loading, errorMsg, searchTerm, setSearchTerm } = useAuthUsers();
  
  // Mock data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 5000 },
    { name: 'Mar', revenue: 3000 },
    { name: 'Apr', revenue: 7000 },
    { name: 'May', revenue: 5000 },
    { name: 'Jun', revenue: 8000 },
    { name: 'Jul', revenue: 10000 },
    { name: 'Aug', revenue: 12000 },
    { name: 'Sep', revenue: 9000 },
    { name: 'Oct', revenue: 11000 },
    { name: 'Nov', revenue: 14000 },
    { name: 'Dec', revenue: 16000 },
  ];

  const campaignData = [
    { name: 'Jan', campaign1: 2400, campaign2: 1800, campaign3: 3200 },
    { name: 'Feb', campaign1: 1900, campaign2: 2700, campaign3: 2900 },
    { name: 'Mar', campaign1: 3000, campaign2: 2000, campaign3: 2400 },
    { name: 'Apr', campaign1: 2800, campaign2: 2300, campaign3: 3100 },
    { name: 'May', campaign1: 3500, campaign2: 2600, campaign3: 3300 },
    { name: 'Jun', campaign1: 3700, campaign2: 3100, campaign3: 3700 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <Clock size={16} className="mr-2" />
            Last 30 Days
          </button>
          <button className="btn-primary">
            <TrendingUp size={16} className="mr-2" />
            Generate Report
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.length.toString()}
          icon={<Users size={24} />}
          change={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Active Projects"
          value="42"
          icon={<FolderKanban size={24} />}
          change={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Running Campaigns"
          value="18"
          icon={<BarChart size={24} />}
          change={{ value: 4.7, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value="$158,430"
          icon={<TrendingUp size={24} />}
          change={{ value: 15.3, isPositive: true }}
        />
      </div>
      
      {/* User List Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
          <h2 className="text-lg font-semibold">System Users</h2>
          
          {/* Search */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <UserLoadingState />
        ) : errorMsg ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{errorMsg}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <UserTable users={users} />
        )}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={revenueData}
          dataKeys={['revenue']}
          colors={['#3b82f6']}
          title="Revenue Overview"
          subtitle="Monthly revenue for the current year"
        />
        <LineChart
          data={campaignData}
          dataKeys={['campaign1', 'campaign2', 'campaign3']}
          title="Campaign Performance"
          subtitle="Performance metrics for top 3 campaigns"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
