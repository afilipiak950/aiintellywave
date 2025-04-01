
import { supabase } from '@/integrations/supabase/client';
import { RevenueMetrics } from '@/types/revenue';
import { toast } from '@/hooks/use-toast';

/**
 * Fetch revenue metrics for a specific month/year
 */
export const getRevenueMetrics = async (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<RevenueMetrics> => {
  try {
    const { data, error } = await supabase.rpc('get_revenue_metrics', {
      p_year: year,
      p_month: month
    });

    if (error) {
      console.error('Error fetching revenue metrics from function:', error);
      throw error;
    }
    
    // Return default metrics if data is null or undefined
    if (!data) {
      return {
        total_revenue: 0,
        total_appointments: 0,
        avg_revenue_per_appointment: 0,
        total_recurring_revenue: 0,
        total_setup_revenue: 0,
        customer_count: 0
      };
    }
    
    // Handle the case where data is an array by taking the first element
    // This ensures we're working with a single object to match the RevenueMetrics type
    const metricsData = Array.isArray(data) ? data[0] : data;
    
    // Ensure all numeric fields are properly cast
    return {
      total_revenue: Number(metricsData.total_revenue) || 0,
      total_appointments: Number(metricsData.total_appointments) || 0,
      avg_revenue_per_appointment: Number(metricsData.avg_revenue_per_appointment) || 0,
      total_recurring_revenue: Number(metricsData.total_recurring_revenue) || 0,
      total_setup_revenue: Number(metricsData.total_setup_revenue) || 0,
      customer_count: Number(metricsData.customer_count) || 0
    };
  } catch (error) {
    console.error('Error in getRevenueMetrics:', error);
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
