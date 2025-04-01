
import KpiCardRevenue from '../KpiCardRevenue';
import { RevenueMetrics } from '@/types/revenue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RevenueDashboardKpisProps {
  metrics: RevenueMetrics | null;
  loading: boolean;
  error?: string | null;
}

const RevenueDashboardKpis = ({ metrics, loading, error }: RevenueDashboardKpisProps) => {
  // Add debug output to help troubleshooting
  console.log('RevenueDashboardKpis rendering with:', { metrics, loading, error });
  
  // Show error if present
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading metrics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <>
      {/* KPI Cards - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <KpiCardRevenue 
          title="Total Revenue"
          value={metrics?.total_revenue || 0}
          icon="money"
          variant="primary"
          format="currency"
          isLoading={loading}
          size="sm"
        />
        <KpiCardRevenue 
          title="Appointments" 
          value={metrics?.total_appointments || 0}
          icon="calendar"
          variant="warning"
          isLoading={loading}
          size="sm"
        />
        <KpiCardRevenue 
          title="Revenue per Appointment" 
          value={metrics?.avg_revenue_per_appointment || 0}
          icon="trend"
          variant="success"
          format="currency"
          isLoading={loading}
          size="sm"
        />
      </div>

      {/* KPI Cards - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <KpiCardRevenue 
          title="Recurring Revenue" 
          value={metrics?.total_recurring_revenue || 0}
          icon="money"
          variant="info"
          format="currency"
          isLoading={loading}
          size="sm"
        />
        <KpiCardRevenue 
          title="Setup Revenue" 
          value={metrics?.total_setup_revenue || 0}
          icon="money"
          variant="default"
          format="currency"
          isLoading={loading}
          size="sm"
        />
        <KpiCardRevenue 
          title="Active Customers" 
          value={metrics?.customer_count || 0}
          icon="users"
          variant="success"
          isLoading={loading}
          size="sm"
        />
      </div>

      {/* Show message when no data but not loading */}
      {!loading && metrics && Object.values(metrics).every(v => v === 0) && (
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No revenue data found for this period. Try creating sample data 
            or ensure you have the correct permissions.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default RevenueDashboardKpis;
