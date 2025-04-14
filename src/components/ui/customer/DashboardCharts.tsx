
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';
import { useDashboardData } from './dashboard/useDashboardData';

const CustomerDashboardCharts: React.FC = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { allLeads } = useLeads();
  
  // Use the dashboard data hook to handle the data processing
  const {
    loading,
    leadsByStatus,
    leadsByProject,
    totalLeads,
    totalAllLeads,
    companyId
  } = useDashboardData(user?.id, projects, allLeads);
  
  // Memoize charts to prevent unnecessary re-renders
  const statusChart = useMemo(() => {
    if (leadsByStatus.length === 0) {
      return (
        <div className="flex justify-center items-center h-48 text-muted-foreground">
          Keine Daten verfügbar
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={leadsByStatus}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {leadsByStatus.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Anzahl']} />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [leadsByStatus]);
  
  const projectChart = useMemo(() => {
    if (leadsByProject.length === 0) {
      return (
        <div className="flex justify-center items-center h-48 text-muted-foreground">
          Keine Daten verfügbar
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={leadsByProject}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Leads']} />
          <Bar dataKey="leads" fill="#8884d8">
            {leadsByProject.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }, [leadsByProject]);
  
  // Show loading state during data fetching
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If no company association is found, show a message
  if (!companyId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <p>Um Statistiken zu sehen, müssen Sie einer Firma zugeordnet sein.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle the case when there's no lead data
  if (totalLeads === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <p>Keine Leads für Ihre Projekte gefunden.</p>
            {totalAllLeads > 0 && (
              <p className="mt-2 text-sm">
                Im System befinden sich insgesamt {totalAllLeads} Leads, aber keiner davon ist Ihren Firmenprojekten zugeordnet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Leads nach Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusChart}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Leads nach Projekt</CardTitle>
        </CardHeader>
        <CardContent>
          {projectChart}
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(CustomerDashboardCharts);
