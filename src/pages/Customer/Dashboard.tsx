import { FolderKanban, Calendar, BarChart, MessageSquare } from 'lucide-react';
import StatCard from '../../components/ui/dashboard/StatCard';
import LineChart from '../../components/ui/dashboard/LineChart';
import { useAuth } from '../../context/auth';

const CustomerDashboard = () => {
  const { user } = useAuth();
  
  // Mock data for charts
  const campaignData = [
    { name: 'Jan', views: 4000, clicks: 2400, conversions: 800 },
    { name: 'Feb', views: 3000, clicks: 1600, conversions: 600 },
    { name: 'Mar', views: 5000, clicks: 2700, conversions: 900 },
    { name: 'Apr', views: 7000, clicks: 4000, conversions: 1200 },
    { name: 'May', views: 6000, clicks: 3200, conversions: 1100 },
    { name: 'Jun', views: 8000, clicks: 4800, conversions: 1600 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'Customer'}</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value="3"
          icon={<FolderKanban size={24} />}
          change={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Running Campaigns"
          value="2"
          icon={<BarChart size={24} />}
          change={{ value: 50, isPositive: true }}
        />
        <StatCard
          title="Upcoming Meetings"
          value="4"
          icon={<Calendar size={24} />}
          change={{ value: 33.3, isPositive: true }}
        />
        <StatCard
          title="Unread Messages"
          value="7"
          icon={<MessageSquare size={24} />}
          change={{ value: 16.7, isPositive: false }}
        />
      </div>
      
      {/* Campaign Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <LineChart
          data={campaignData}
          dataKeys={['views', 'clicks', 'conversions']}
          title="Campaign Performance"
          subtitle="Performance metrics for your active campaigns"
        />
      </div>
      
      {/* Recent Projects and Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
          <div className="space-y-4">
            {[
              { name: 'Website Redesign', status: 'In Progress', progress: 65 },
              { name: 'Social Media Campaign', status: 'Active', progress: 40 },
              { name: 'Brand Identity Update', status: 'Planned', progress: 0 }
            ].map((project, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    project.status === 'Active' ? 'bg-green-100 text-green-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
          <div className="space-y-4">
            {[
              { date: '15 Mar', time: '10:00 AM', title: 'Project Kickoff Meeting', participants: 4 },
              { date: '18 Mar', time: '02:30 PM', title: 'Campaign Strategy Review', participants: 3 },
              { date: '22 Mar', time: '11:00 AM', title: 'Website Design Feedback', participants: 5 },
              { date: '24 Mar', time: '09:15 AM', title: 'Quarterly Progress Report', participants: 6 }
            ].map((meeting, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="h-14 w-12 flex-shrink-0 bg-blue-50 rounded-md flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-blue-700">MAR</span>
                  <span className="text-lg font-bold text-blue-700">{meeting.date.split(' ')[0]}</span>
                </div>
                
                <div className="flex-1 border-b pb-4 last:border-0">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <span className="text-sm text-gray-500">{meeting.time}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {meeting.participants} participants
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing Users icon from lucide-react
import { Users } from 'lucide-react';

export default CustomerDashboard;
