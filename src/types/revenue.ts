
export interface CustomerRevenue {
  id?: string;
  customer_id: string;
  customer_name?: string;
  year: number;
  month: number;
  setup_fee: number;
  price_per_appointment: number;
  appointments_delivered: number;
  recurring_fee: number;
  total_revenue?: number;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RevenueMetrics {
  total_revenue: number;
  total_appointments: number;
  avg_revenue_per_appointment: number;
  total_recurring_revenue: number;
  total_setup_revenue: number;
  customer_count: number;
}

export interface MonthColumn {
  year: number;
  month: number;
  label: string;
}

export interface CustomerRevenueRow {
  customer_id: string;
  customer_name: string;
  months: Record<string, CustomerRevenue>;
}
