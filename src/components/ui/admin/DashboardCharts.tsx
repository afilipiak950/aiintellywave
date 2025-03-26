
import { BarChart4, LineChart as LineChartIcon, PieChart, TrendingUp, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LineChart from '../dashboard/LineChart';
import { AnimatedAgents } from '../animated-agents';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from 'recharts';

const DashboardCharts = () => {
  const [userActivityData, setUserActivityData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Example data - in a real app, this would come from the database
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        // Generate last 6 months of user activity data
        const userActivity = Array.from({ length: 6 }, (_, i) => {
          const monthIndex = (currentMonth - 5 + i) % 12;
          return {
            name: monthNames[monthIndex >= 0 ? monthIndex : monthIndex + 12],
            users: Math.floor(Math.random() * 50) + 10,
            active: Math.floor(Math.random() * 30) + 5,
          };
        });
        
        // Generate project data for visualization
        const projects = [
          { name: 'Active', value: Math.floor(Math.random() * 20) + 5 },
          { name: 'Completed', value: Math.floor(Math.random() * 15) + 10 },
          { name: 'On Hold', value: Math.floor(Math.random() * 8) + 2 },
          { name: 'New', value: Math.floor(Math.random() * 10) + 3 },
        ];
        
        setUserActivityData(userActivity);
        setProjectData(projects);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, []);
  
  // Colors for the bar chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-80">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-blue-500" />
            User Activity Trends
          </h3>
          <p className="text-sm text-gray-500">Monthly active users</p>
        </div>
        <div className="relative h-64 w-full">
          <LineChart 
            data={userActivityData}
            dataKeys={['users', 'active']}
            title=""
            subtitle=""
          />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-80">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <BarChart4 className="w-5 h-5 text-purple-500" />
            Project Distribution
          </h3>
          <p className="text-sm text-gray-500">Status breakdown of all projects</p>
        </div>
        <div className="relative h-64 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={projectData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm overflow-hidden lg:col-span-2 relative p-6 h-64">
        <div className="relative z-10">
          <h3 className="text-xl font-medium mb-2">Admin Dashboard Overview</h3>
          <p className="text-blue-100 mb-4">Interactive visualization of your system activities</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in">
              <h4 className="font-medium text-lg">User Growth</h4>
              <div className="text-3xl font-bold mt-2">+24%</div>
              <p className="text-sm text-blue-100 mt-1">vs. last quarter</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h4 className="font-medium text-lg">Project Completion</h4>
              <div className="text-3xl font-bold mt-2">87%</div>
              <p className="text-sm text-blue-100 mt-1">success rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-medium text-lg">System Health</h4>
              <div className="text-3xl font-bold mt-2">99.9%</div>
              <p className="text-sm text-blue-100 mt-1">uptime this month</p>
            </div>
          </div>
        </div>
        <AnimatedAgents />
      </div>
    </div>
  );
};

export default DashboardCharts;
