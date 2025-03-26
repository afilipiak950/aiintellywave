
import { TrendingUp } from 'lucide-react';
import { AnimatedAgents } from '../animated-agents';

const AdminOverview = () => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm overflow-hidden lg:col-span-2 relative p-6 h-64 transform hover:shadow-xl transition-all duration-300">
      <div className="relative z-10">
        <h3 className="text-xl font-medium mb-2">Admin Dashboard Overview</h3>
        <p className="text-blue-100 mb-4">Interactive visualization of your system activities</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
            <h4 className="font-medium text-lg">User Growth</h4>
            <div className="text-3xl font-bold mt-2">+24%</div>
            <p className="text-sm text-blue-100 mt-1">vs. last quarter</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-medium text-lg">Project Completion</h4>
            <div className="text-3xl font-bold mt-2">87%</div>
            <p className="text-sm text-blue-100 mt-1">success rate</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-medium text-lg">System Health</h4>
            <div className="text-3xl font-bold mt-2">99.9%</div>
            <p className="text-sm text-blue-100 mt-1">uptime this month</p>
          </div>
        </div>
      </div>
      <AnimatedAgents />
    </div>
  );
};

export default AdminOverview;
