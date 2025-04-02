
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'lucide-react';

interface UserKPI {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  projects_count: number;
  projects_planning: number;
  projects_active: number;
  projects_completed: number;
  campaigns_count: number;
  leads_count: number;
  appointments_count: number;
}

const ManagerKPIDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<UserKPI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Get the user's company ID
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data?.company_id) {
          throw new Error("No company found for this user");
        }

        setCompanyId(data.company_id);
        fetchKPIData(data.company_id);
      } catch (error: any) {
        console.error("Error fetching company ID:", error);
        setError(error.message || "Failed to fetch company data");
        setLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  const fetchKPIData = async (companyId: string) => {
    try {
      setLoading(true);
      
      // Call the RPC function to get KPI data
      const { data, error } = await supabase.rpc(
        'get_company_user_kpis',
        { company_id_param: companyId }
      );

      if (error) {
        throw error;
      }

      console.log("KPI data:", data);
      setKpiData(data || []);
    } catch (error: any) {
      console.error("Error fetching KPI data:", error);
      setError(error.message || "Failed to load KPI data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
        <p className="mb-4">{error}</p>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => companyId && fetchKPIData(companyId)}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (kpiData.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">No KPI Data</h2>
        <p>There is no KPI data available for your team members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manager KPI Dashboard</h1>
        <button
          onClick={() => companyId && fetchKPIData(companyId)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.reduce((sum, user) => sum + (user.projects_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.reduce((sum, user) => sum + (user.leads_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.reduce((sum, user) => sum + (user.appointments_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 bg-muted">
                  <th className="p-4 align-middle font-medium text-left">Team Member</th>
                  <th className="p-4 align-middle font-medium text-center">Projects</th>
                  <th className="p-4 align-middle font-medium text-center">Campaigns</th>
                  <th className="p-4 align-middle font-medium text-center">Leads</th>
                  <th className="p-4 align-middle font-medium text-center">Appointments</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.map((user) => (
                  <tr key={user.user_id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">{user.projects_count || 0}</td>
                    <td className="p-4 align-middle text-center">{user.campaigns_count || 0}</td>
                    <td className="p-4 align-middle text-center">{user.leads_count || 0}</td>
                    <td className="p-4 align-middle text-center">{user.appointments_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="projects" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 bg-muted">
                  <th className="p-4 align-middle font-medium text-left">Team Member</th>
                  <th className="p-4 align-middle font-medium text-center">Total Projects</th>
                  <th className="p-4 align-middle font-medium text-center">In Planning</th>
                  <th className="p-4 align-middle font-medium text-center">Active</th>
                  <th className="p-4 align-middle font-medium text-center">Completed</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.map((user) => (
                  <tr key={user.user_id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">{user.projects_count || 0}</td>
                    <td className="p-4 align-middle text-center">{user.projects_planning || 0}</td>
                    <td className="p-4 align-middle text-center">{user.projects_active || 0}</td>
                    <td className="p-4 align-middle text-center">{user.projects_completed || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="leads" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 bg-muted">
                  <th className="p-4 align-middle font-medium text-left">Team Member</th>
                  <th className="p-4 align-middle font-medium text-center">Total Leads</th>
                  <th className="p-4 align-middle font-medium text-center">Conversion Rate</th>
                  <th className="p-4 align-middle font-medium text-center">Appointments</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.map((user) => (
                  <tr key={user.user_id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">{user.leads_count || 0}</td>
                    <td className="p-4 align-middle text-center">
                      {user.leads_count && user.appointments_count 
                        ? `${((user.appointments_count / user.leads_count) * 100).toFixed(1)}%` 
                        : '0%'}
                    </td>
                    <td className="p-4 align-middle text-center">{user.appointments_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerKPIDashboard;
