
import KpiCardRevenue from '../KpiCardRevenue';
import { RevenueMetrics } from '@/types/revenue';

interface RevenueDashboardKpisProps {
  metrics: RevenueMetrics | null;
  loading: boolean;
}

const RevenueDashboardKpis = ({ metrics, loading }: RevenueDashboardKpisProps) => {
  return (
    <>
      {/* KPI Cards - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCardRevenue 
          title="Total Revenue"
          value={metrics?.total_revenue || 0}
          icon="money"
          variant="primary"
          format="currency"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Appointments" 
          value={metrics?.total_appointments || 0}
          icon="calendar"
          variant="warning"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Revenue per Appointment" 
          value={metrics?.avg_revenue_per_appointment || 0}
          icon="trend"
          variant="success"
          format="currency"
          isLoading={loading}
        />
      </div>

      {/* KPI Cards - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCardRevenue 
          title="Recurring Revenue" 
          value={metrics?.total_recurring_revenue || 0}
          icon="money"
          variant="info"
          format="currency"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Setup Revenue" 
          value={metrics?.total_setup_revenue || 0}
          icon="money"
          variant="default"
          format="currency"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Active Customers" 
          value={metrics?.customer_count || 0}
          icon="users"
          variant="success"
          isLoading={loading}
        />
      </div>
    </>
  );
};

export default RevenueDashboardKpis;
