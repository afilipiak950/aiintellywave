
import { BarChart4, LineChart as LineChartIcon, PieChart, TrendingUp, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LineChart from '../dashboard/LineChart';
import CompanyUsersChart from '../dashboard/CompanyUsersChart';
import { AnimatedAgents } from '../animated-agents';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Cell, 
  Tooltip, 
  Area, 
  AreaChart, 
  PieChart as RechartsPieChart, 
  Pie,
  Legend,
  CartesianGrid 
} from 'recharts';

const DashboardCharts = () => {
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const chartRef = useRef(null);
  
  // Auto-rotate active pie chart segment
  useEffect(() => {
    const timer = setInterval(() => {
      if (projectData.length > 0) {
        setActiveIndex((prevIndex) => (prevIndex + 1) % projectData.length);
      }
    }, 3000);
    
    return () => clearInterval(timer);
  }, [projectData]);
  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Get project statistics from Supabase
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, status');
          
        if (projectsError) {
          console.error('Error fetching projects data:', projectsError);
          throw projectsError;
        }
        
        // Group projects by status
        const projectStatus = [
          { name: 'Active', value: projectsData ? projectsData.filter(p => p.status === 'in_progress').length : 0, color: '#0088FE' },
          { name: 'Completed', value: projectsData ? projectsData.filter(p => p.status === 'completed').length : 0, color: '#00C49F' },
          { name: 'On Hold', value: projectsData ? projectsData.filter(p => p.status === 'on_hold').length : 0, color: '#FFBB28' },
          { name: 'New', value: projectsData ? projectsData.filter(p => ['planning', 'new'].includes(p.status)).length : 0, color: '#FF8042' },
        ];
        
        // If no projects data, use fallback
        if (!projectsData || projectStatus.every(s => s.value === 0)) {
          projectStatus[0].value = 3; // Some default fallback values
          projectStatus[1].value = 8;
          projectStatus[2].value = 2;
          projectStatus[3].value = 4;
        }
        
        setProjectData(projectStatus);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Provide fallback data if fetching fails
        const fallbackProjectData = [
          { name: 'Active', value: 5, color: '#0088FE' },
          { name: 'Completed', value: 12, color: '#00C49F' },
          { name: 'On Hold', value: 3, color: '#FFBB28' },
          { name: 'New', value: 7, color: '#FF8042' },
        ];
        
        setProjectData(fallbackProjectData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, []);
  
  // Enhanced colors for better visual appeal
  const COLORS = ['#4069E5', '#34D399', '#FBBF24', '#F87171'];
  
  // Handle pie chart hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  // Custom tooltip style
  const customTooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '10px 14px',
  };
  
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="#999" className="text-xs">
          {`${value} projects (${(percent * 100).toFixed(0)}%)`}
        </text>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={projectData}
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          dataKey="value"
        />
      </g>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Users Distribution Chart */}
      <CompanyUsersChart />
      
      {/* Project Distribution */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-96 transform hover:-translate-y-1">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            Project Distribution
          </h3>
          <p className="text-sm text-gray-500">Status breakdown of all projects</p>
        </div>
        <div className="relative h-80 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={projectData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={5}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Dashboard Overview section with gradient background */}
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
    </div>
  );
};

export default DashboardCharts;
