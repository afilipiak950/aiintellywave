
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ManagerKPI = () => {
  // Log when the page is mounted to verify it's working correctly
  useEffect(() => {
    console.log("[ManagerKPI] Page mounted");
    
    // Verify the user's KPI access on this page
    const verifyKPIAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("[ManagerKPI] No authenticated user found");
        return;
      }
      
      // Check user's KPI status directly
      const { data, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled, company_id')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('[ManagerKPI] Error fetching KPI status:', error);
        return;
      }
      
      const kpiEnabled = data?.some(row => row.is_manager_kpi_enabled === true);
      console.log('[ManagerKPI] User KPI access verified:', kpiEnabled);
    };
    
    verifyKPIAccess();
  }, []);
  
  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Manager KPI Dashboard</h1>
        <p className="text-muted-foreground">
          Track and analyze key performance indicators for your team and projects.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 since last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +4 since last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +2% since last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€24,500</div>
                <p className="text-xs text-muted-foreground">
                  +7% since last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Team and project performance metrics for the current quarter
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
                Performance chart will be displayed here
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>KPI Tracker</CardTitle>
                <CardDescription>
                  Progress against quarterly KPIs
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
                KPI progress visualization will be displayed here
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>
                Individual team member metrics and contributions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
              Team performance data will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance</CardTitle>
              <CardDescription>
                Status and metrics for all active projects
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
              Project data will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>
                Financial performance and revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
              Revenue data will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerKPI;
