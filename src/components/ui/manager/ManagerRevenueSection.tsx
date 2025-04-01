
import React, { useEffect } from 'react';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart3, FileDown, AlertCircle } from 'lucide-react';
import StatCard from '../dashboard/StatCard';

interface ManagerRevenueSectionProps {
  companyId: string;
}

const ManagerRevenueSection = ({ companyId }: ManagerRevenueSectionProps) => {
  const {
    metrics,
    refreshData,
    currentYear,
    currentMonth,
    exportCsv,
    loading,
    permissionsError
  } = useRevenueDashboard(12);
  
  // Initialize with data
  useEffect(() => {
    refreshData();
  }, [companyId, refreshData]);
  
  // Create a safe version of exportCsv to handle type mismatch
  const handleExport = () => {
    if (typeof exportCsv === 'function') {
      exportCsv(currentYear, currentMonth);
    }
  };

  // Show error if permissions issue
  if (permissionsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission Error</AlertTitle>
        <AlertDescription>{permissionsError}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Revenue Overview</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={loading}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refreshData()}
            disabled={loading}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(metrics?.total_revenue || 0)} 
          trend={{ value: '2.5', positive: true }}
          loading={loading}
        />
        <StatCard 
          title="Monthly Appointments" 
          value={metrics?.total_appointments?.toString() || '0'} 
          trend={{ value: '1.2', positive: true }}
          loading={loading}
        />
        <StatCard 
          title="Recurring Revenue" 
          value={new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(metrics?.total_recurring_revenue || 0)} 
          trend={{ value: '3.7', positive: true }}
          loading={loading}
        />
      </div>
      
      {/* Show message when no data but not loading */}
      {!loading && metrics && Object.values(metrics).every(v => v === 0) && (
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No revenue data found for this period.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ManagerRevenueSection;
