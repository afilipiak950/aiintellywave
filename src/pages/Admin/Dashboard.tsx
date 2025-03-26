
import { useAuthUsers } from '../../hooks/use-auth-users';
import DashboardHeader from '../../components/ui/admin/DashboardHeader';
import DashboardStats from '../../components/ui/admin/DashboardStats';
import UsersSection from '../../components/ui/admin/UsersSection';
import DashboardCharts from '../../components/ui/admin/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  // Use our hook to fetch auth users
  const { users, loading, errorMsg, searchTerm, setSearchTerm } = useAuthUsers();
  
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
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent projects found.</p>
                <a href="/admin/projects/new" className="btn-primary inline-flex mt-4">Create New Project</a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">New customer added</p>
                    <p className="text-sm text-muted-foreground">A new customer was added to the system</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">2 hours ago</div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">Project status updated</p>
                    <p className="text-sm text-muted-foreground">The status of Project X was changed to "In Progress"</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">Yesterday</div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">New user registered</p>
                    <p className="text-sm text-muted-foreground">A new user has registered to the platform</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">3 days ago</div>
                </div>
              </div>
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
