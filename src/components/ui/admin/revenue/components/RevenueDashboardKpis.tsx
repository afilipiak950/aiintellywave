
import React from 'react';
import { RevenueMetrics } from '@/types/revenue';
import KpiCardRevenue from '../KpiCardRevenue';

interface RevenueDashboardKpisProps {
  metrics: RevenueMetrics | null;
  loading: boolean;
  error?: string | null;
}

const RevenueDashboardKpis: React.FC<RevenueDashboardKpisProps> = ({
  metrics,
  loading,
  error
}) => {
  if (error) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KpiCardRevenue
        title="Gesamtumsatz"
        value={metrics?.total_revenue || 0}
        icon="money"
        variant="primary"
        format="currency"
        isLoading={loading}
      />
      <KpiCardRevenue
        title="Termine"
        value={metrics?.total_appointments || 0}
        icon="calendar"
        variant="success"
        isLoading={loading}
      />
      <KpiCardRevenue
        title="Umsatz pro Termin"
        value={metrics?.avg_revenue_per_appointment || 0}
        icon="trend"
        variant="info"
        format="currency"
        isLoading={loading}
      />
      <KpiCardRevenue
        title="Aktive Kunden"
        value={metrics?.customer_count || 0}
        icon="users"
        variant="warning"
        isLoading={loading}
      />
    </div>
  );
};

export default RevenueDashboardKpis;
