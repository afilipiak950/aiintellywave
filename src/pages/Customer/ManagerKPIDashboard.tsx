
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

const ManagerKPIDashboard: React.FC = () => {
  const { kpis, loading, error } = useCompanyUserKPIs();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading KPIs: {error}
      </div>
    );
  }

  const projectsData = kpis.map(user => ({
    name: user.full_name,
    planning: user.projects_planning,
    active: user.projects_active,
    completed: user.projects_completed
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planning" stackId="a" fill="#8884d8" name="Planning" />
                <Bar dataKey="active" stackId="a" fill="#82ca9d" name="Active" />
                <Bar dataKey="completed" stackId="a" fill="#ffc658" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed KPIs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Appointments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpis.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.projects_count}</TableCell>
                    <TableCell>{user.campaigns_count}</TableCell>
                    <TableCell>{user.leads_count}</TableCell>
                    <TableCell>{user.appointments_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerKPIDashboard;
