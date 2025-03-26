
import { useEffect } from 'react';
import { useAuthUsers } from '../../hooks/use-auth-users';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import UsersSection from '../../components/ui/admin/UsersSection';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // Use our hook to fetch auth users
  const { users, loading, errorMsg, searchTerm, setSearchTerm, refreshUsers } = useAuthUsers();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  useEffect(() => {
    // Fetch recent projects
    const fetchRecentProjects = async () => {
      try {
        setProjectsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, description, status, company_id, companies(name), created_at')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        setRecentProjects(data || []);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    // Fetch recent activities
    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);
        
        // Try to find recent activities from various sources
        const activities = [];
        
        // Check project feedback for recent activity
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('project_feedback')
          .select('id, content, created_at, project_id, projects(name), user_id')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (feedbackError) throw feedbackError;
        
        // Format feedback as activities
        const feedbackActivities = feedbackData?.map(item => ({
          id: item.id,
          type: 'feedback',
          title: 'Project feedback added',
          description: `New feedback was added to project ${item.projects?.name || 'Unknown'}`,
          timestamp: item.created_at
        })) || [];
        
        activities.push(...feedbackActivities);
        
        // Also check for recent user sign-ups
        const { data: recentUsers, error: usersError } = await supabase
          .from('company_users')
          .select('id, email, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (usersError) throw usersError;
        
        // Format user creations as activities
        const userActivities = recentUsers?.map(user => ({
          id: user.id,
          type: 'user_created',
          title: 'New user registered',
          description: `${user.full_name || user.email || 'A new user'} was added to the system`,
          timestamp: user.created_at
        })) || [];
        
        activities.push(...userActivities);
        
        // Also check for recent project status updates
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, status, updated_at')
          .order('updated_at', { ascending: false })
          .limit(3);
          
        if (projectsError) throw projectsError;
        
        // Format project updates as activities
        const projectActivities = projectsData?.map(project => ({
          id: project.id,
          type: 'project_update',
          title: 'Project status updated',
          description: `The status of project "${project.name}" was changed to "${project.status}"`,
          timestamp: project.updated_at
        })) || [];
        
        activities.push(...projectActivities);
        
        // Sort all activities by timestamp
        const sortedActivities = activities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 5);
        
        setRecentActivities(sortedActivities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };
    
    fetchRecentProjects();
    fetchRecentActivities();
  }, []);
  
  // Format relative time for activities
  const formatActivityTime = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return activityTime.toLocaleDateString();
  };
  
  return (
    <div className="space-y-8">
      <DashboardHeader />
      
      {/* Stats Cards */}
      <DashboardStats userCount={users.length} />
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
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
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Recent Projects</CardTitle>
              <Link to="/admin/projects" className="text-sm text-primary hover:underline">
                View All Projects
              </Link>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map(project => (
                    <Link 
                      key={project.id} 
                      to={`/admin/projects/${project.id}`}
                      className="flex flex-col p-4 bg-muted/50 rounded-lg hover:bg-muted"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{project.description || 'No description'}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          Client: {project.companies?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent projects found.</p>
                  <Link to="/admin/projects/new" className="btn-primary inline-flex mt-4">Create New Project</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="ml-auto text-sm text-muted-foreground">
                        {formatActivityTime(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activities found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-8">
          <DashboardCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
