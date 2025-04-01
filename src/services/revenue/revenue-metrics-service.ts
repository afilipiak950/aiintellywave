
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
    console.log(`Fetching revenue metrics for ${month}/${year}`);
    
    // First check if the customers table exists and is accessible
    const { data: customersCheck, error: customersError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
      
    if (customersError) {
      console.error('Cannot access customers table:', customersError);
      throw new Error(`Customers table access error: ${customersError.message}`);
    }
    
    // Now try to access the customer_revenue table
    const { data: revenueCheck, error: revenueError } = await supabase
      .from('customer_revenue')
      .select('id')
      .limit(1);
      
    if (revenueError) {
      console.error('Cannot access customer_revenue table:', revenueError);
      throw new Error(`Customer revenue table access error: ${revenueError.message}`);
    }
    
    // If both tables are accessible, call the function
    const { data, error } = await supabase.rpc('get_revenue_metrics', {
      p_year: year,
      p_month: month
    });

    if (error) {
      console.error('Error fetching revenue metrics from function:', error);
      throw error;
    }
    
    console.log('Raw revenue metrics data:', data);
    
    // Return default metrics if data is null or undefined
    if (!data) {
      console.warn('No revenue metrics data returned from function');
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
    toast({
      title: 'Fehler beim Laden der Metriken',
      description: error instanceof Error ? error.message : 'Unbekannter Fehler',
      variant: 'destructive'
    });
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
