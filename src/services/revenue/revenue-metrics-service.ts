
import { supabase } from '@/integrations/supabase/client';
import { RevenueMetrics } from '@/types/revenue';

/**
 * Fetch metrics for a specific period (month/year)
 */
export const getRevenueMetrics = async (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<RevenueMetrics> => {
  try {
    console.log(`Fetching revenue metrics for ${month}/${year}`);
    
    // Use the sum of all revenue entries for the specified month
    const { data: revenueData, error: revenueError } = await supabase
      .from('customer_revenue')
      .select('*')
      .eq('year', year)
      .eq('month', month);
      
    if (revenueError) throw revenueError;
    
    // Calculate metrics from the raw data
    const totalAppointments = revenueData?.reduce((sum, item) => sum + (item.appointments_delivered || 0), 0) || 0;
    const totalRecurringRevenue = revenueData?.reduce((sum, item) => sum + (item.recurring_fee || 0), 0) || 0;
    const totalSetupRevenue = revenueData?.reduce((sum, item) => sum + (item.setup_fee || 0), 0) || 0;
    const totalAppointmentRevenue = revenueData?.reduce(
      (sum, item) => sum + ((item.price_per_appointment || 0) * (item.appointments_delivered || 0)), 0
    ) || 0;
    
    const totalRevenue = totalRecurringRevenue + totalSetupRevenue + totalAppointmentRevenue;
    const customerCount = revenueData ? new Set(revenueData.map(item => item.customer_id)).size : 0;
    const avgRevenuePerAppointment = totalAppointments > 0 ? totalAppointmentRevenue / totalAppointments : 0;
    
    const metrics: RevenueMetrics = {
      total_revenue: totalRevenue,
      total_appointments: totalAppointments,
      avg_revenue_per_appointment: avgRevenuePerAppointment,
      total_recurring_revenue: totalRecurringRevenue,
      total_setup_revenue: totalSetupRevenue,
      customer_count: customerCount
    };
    
    return metrics;
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    // Return default metrics on error
    return {
      total_revenue: 0,
      total_appointments: 0,
      avg_revenue_per_appointment: 0,
      total_recurring_revenue: 0,
      total_setup_revenue: 0,
      customer_count: 0
    };
  }
};
