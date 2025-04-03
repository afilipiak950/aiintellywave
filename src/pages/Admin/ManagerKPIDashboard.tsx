
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  PieChart, 
  LineChart, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckSquare
} from 'lucide-react';
import { useKpiMetrics } from '@/hooks/use-kpi-metrics';
import { toast } from '@/hooks/use-toast';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: { value: string; isPositive: boolean };
  icon: React.ReactNode;
  description?: string;
}

const KpiCard = ({ title, value, change, icon, description }: KpiCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full bg-muted p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {change && (
          <div className="flex items-center mt-2">
            {change.isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {change.value}% from previous month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ManagerKPIDashboard = () => {
  const [loading, setLoading] = useState(true);
  const { metrics, fetchMetrics, calculateGrowth } = useKpiMetrics();
  const [teamMembers, setTeamMembers] = useState(0);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch KPI metrics like conversion rate and booking candidates
        await fetchMetrics(['conversion_rate', 'team_performance', 'project_completion']);
        
        // Simulate loading team members count - replace with actual API call in production
        setTimeout(() => {
          setTeamMembers(12);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [fetchMetrics]);
  
  // Recent activity simulation data
  const recentActivity = [
    { id: 1, action: 'Project completed', user: 'Jane Cooper', time: '2 hours ago' },
    { id: 2, action: 'New customer onboarded', user: 'Wade Warren', time: '5 hours ago' },
    { id: 3, action: 'Campaign launched', user: 'Esther Howard', time: '1 day ago' },
    { id: 4, action: 'Performance review', user: 'Cameron Williamson', time: '2 days ago' },
    { id: 5, action: 'Lead conversion', user: 'Robert Fox', time: '3 days ago' },
  ];
  
  // Demo data for project distribution
  const projectDistribution = [
    { name: 'Planning', value: 15 },
    { name: 'In Progress', value: 25 },
    { name: 'Review', value: 10 },
    { name: 'Complete', value: 50 },
  ];
  
  // Demo data for monthly metrics
  const monthlyMetrics = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 75 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 80 },
    { month: 'May', value: 95 },
    { month: 'Jun', value: 105 },
  ];
  
  // Calculate growth metrics
  const performanceGrowth = metrics.team_performance ? calculateGrowth(
    metrics.team_performance.value, 
    metrics.team_performance.previous_value
  ) : { value: '0.0', isPositive: true };
  
  const completionGrowth = metrics.project_completion ? calculateGrowth(
    metrics.project_completion.value, 
    metrics.project_completion.previous_value
  ) : { value: '0.0', isPositive: true };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manager KPI Dashboard</h1>
        <button
          onClick={() => fetchMetrics(['conversion_rate', 'team_performance', 'project_completion'])}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Team Members"
          value={loading ? "..." : teamMembers}
          icon={<Users className="h-4 w-4" />}
          change={{ value: "5.0", isPositive: true }}
        />
        <KpiCard
          title="Active Projects"
          value={loading ? "..." : "24"}
          icon={<BarChart3 className="h-4 w-4" />}
          change={{ value: "12.5", isPositive: true }}
        />
        <KpiCard
          title="Team Performance"
          value={loading ? "..." : metrics.team_performance?.value || "0"}
          icon={<LineChart className="h-4 w-4" />}
          change={performanceGrowth}
          description="Overall performance score"
        />
        <KpiCard
          title="Project Completion"
          value={loading ? "..." : `${metrics.project_completion?.value || 0}%`}
          icon={<CheckSquare className="h-4 w-4" />}
          change={completionGrowth}
          description="Projects completed on time"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  {loading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  ) : (
                    <div className="w-full">
                      {/* Placeholder for a pie chart */}
                      <div className="space-y-2">
                        {projectDistribution.map(item => (
                          <div key={item.name} className="flex items-center">
                            <div className={`w-full bg-gray-200 rounded-full h-4`}>
                              <div 
                                className={`bg-primary h-4 rounded-full`}
                                style={{ width: `${item.value}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">{item.name}: {item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start">
                        <div className="mr-4 rounded-full bg-primary/10 p-2">
                          <Users size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.user} · {activity.time}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                ) : (
                  <div className="w-full">
                    {/* Placeholder for a line chart */}
                    <div className="relative h-60">
                      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 h-0"></div>
                      <div className="flex justify-between h-full">
                        {monthlyMetrics.map((item, index) => (
                          <div key={index} className="flex flex-col items-center justify-end h-full w-full">
                            <div 
                              className="w-8 bg-primary rounded-t"
                              style={{ height: `${(item.value / 120) * 100}%` }}
                            ></div>
                            <span className="mt-2 text-xs">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50 bg-muted">
                      <th className="p-4 align-middle font-medium text-left">Project</th>
                      <th className="p-4 align-middle font-medium text-left">Manager</th>
                      <th className="p-4 align-middle font-medium text-left">Status</th>
                      <th className="p-4 align-middle font-medium text-left">Progress</th>
                      <th className="p-4 align-middle font-medium text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b transition-colors">
                          <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div></td>
                          <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div></td>
                          <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div></td>
                          <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/5"></div></td>
                          <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-2/5"></div></td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 font-medium">Website Redesign</td>
                          <td className="p-4">John Smith</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">In Progress</span></td>
                          <td className="p-4">75%</td>
                          <td className="p-4">Aug 15, 2025</td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 font-medium">Mobile App Development</td>
                          <td className="p-4">Sarah Johnson</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Completed</span></td>
                          <td className="p-4">100%</td>
                          <td className="p-4">Jul 23, 2025</td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 font-medium">Market Research</td>
                          <td className="p-4">David Lee</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Planning</span></td>
                          <td className="p-4">25%</td>
                          <td className="p-4">Sep 05, 2025</td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 font-medium">Sales Strategy</td>
                          <td className="p-4">Emily Wong</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">Review</span></td>
                          <td className="p-4">90%</td>
                          <td className="p-4">Aug 28, 2025</td>
                        </tr>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 font-medium">Product Launch</td>
                          <td className="p-4">Robert Brown</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">In Progress</span></td>
                          <td className="p-4">60%</td>
                          <td className="p-4">Sep 15, 2025</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerKPIDashboard;
