
import { Users, FolderKanban, BarChart, TrendingUp, Clock } from 'lucide-react';
import StatCard from '../../components/ui/dashboard/StatCard';
import LineChart from '../../components/ui/dashboard/LineChart';

const AdminDashboard = () => {
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
          title="Total Customers"
          value="124"
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
      
      {/* Recent Activity and Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                  <Users size={18} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">New customer registered</p>
                  <p className="text-xs text-gray-500 mt-1">Company XYZ joined the platform</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="h-9 w-9 flex flex-shrink-0">
                  <div className="h-full w-full rounded bg-blue-100 text-blue-600 flex flex-col items-center justify-center text-xs font-medium">
                    <span>MAR</span>
                    <span className="text-sm">{item + 15}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Project Strategy Meeting</p>
                  <p className="text-xs text-gray-500 mt-1">With Client {item} - Project Review</p>
                  <p className="text-xs text-gray-400 mt-1">10:00 AM - 11:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
