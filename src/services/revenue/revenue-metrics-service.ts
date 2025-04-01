
import { supabase } from '@/integrations/supabase/client';
import { RevenueMetrics } from '@/types/revenue';
import { toast } from '@/hooks/use-toast';

/**
 * Calculate total revenue from individual components
 */
export const calculateTotalRevenue = (
  setupFee: number = 0, 
  pricePerAppointment: number = 0,
  appointmentsDelivered: number = 0,
  recurringFee: number = 0
): number => {
  return (setupFee || 0) + 
         ((pricePerAppointment || 0) * (appointmentsDelivered || 0)) + 
         (recurringFee || 0);
};

/**
 * Fetch revenue metrics for a specific month/year
 */
export const getRevenueMetrics = async (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<RevenueMetrics> => {
  try {
    console.log(`Fetching revenue metrics for ${month}/${year}`);
    
    // First check if the user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!userData.user) {
      throw new Error('User is not authenticated');
    }
    
    console.log('User authenticated:', userData.user.id);
    
    // Try direct query first for customer revenue data
    const { data: revenueData, error: revenueError } = await supabase
      .from('customer_revenue')
      .select('*')
      .eq('year', year)
      .eq('month', month);
      
    if (revenueError) {
      console.error('Error fetching customer revenue data:', revenueError);
      throw revenueError;
    }
    
    console.log(`Fetched ${revenueData?.length || 0} revenue records for ${month}/${year}`);
    
    // If we have revenue data, calculate metrics directly
    if (revenueData && revenueData.length > 0) {
      const total_revenue = revenueData.reduce((sum, record) => 
        sum + calculateTotalRevenue(
          record.setup_fee,
          record.price_per_appointment,
          record.appointments_delivered,
          record.recurring_fee
        ), 0);
        
      const total_appointments = revenueData.reduce((sum, record) => 
        sum + (record.appointments_delivered || 0), 0);
        
      const total_recurring_revenue = revenueData.reduce((sum, record) => 
        sum + (record.recurring_fee || 0), 0);
        
      const total_setup_revenue = revenueData.reduce((sum, record) => 
        sum + (record.setup_fee || 0), 0);
        
      let avg_revenue_per_appointment = 0;
      if (total_appointments > 0) {
        avg_revenue_per_appointment = revenueData.reduce((sum, record) => 
          sum + ((record.price_per_appointment || 0) * (record.appointments_delivered || 0)), 0) / total_appointments;
      }
      
      const calculatedMetrics = {
        total_revenue,
        total_appointments,
        avg_revenue_per_appointment,
        total_recurring_revenue,
        total_setup_revenue,
        customer_count: new Set(revenueData.map(r => r.customer_id)).size
      };
      
      console.log('Calculated metrics from revenue data:', calculatedMetrics);
      return calculatedMetrics;
    }
    
    // Fallback to customers table if no revenue data
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*');
      
    if (customersError) {
      console.error('Error fetching customers data:', customersError);
      throw customersError;
    }
    
    console.log(`Fetched ${customersData?.length || 0} customers for metrics calculation`);
    
    if (customersData && customersData.length > 0) {
      // Calculate metrics from customer data
      const total_appointments = customersData.reduce((sum, customer) => 
        sum + (customer.appointments_per_month || 0), 0);
      
      const total_revenue = customersData.reduce((sum, customer) => {
        const monthlyRevenue = 
          ((customer.price_per_appointment || 0) * (customer.appointments_per_month || 0)) + 
          (customer.monthly_flat_fee || 0);
        return sum + monthlyRevenue;
      }, 0);
      
      const total_recurring_revenue = customersData.reduce((sum, customer) => 
        sum + (customer.monthly_flat_fee || 0), 0);
      
      const total_setup_revenue = customersData.reduce((sum, customer) => 
        sum + (customer.setup_fee || 0), 0);
      
      let avg_revenue_per_appointment = 0;
      if (total_appointments > 0) {
        avg_revenue_per_appointment = customersData.reduce((sum, customer) => 
          sum + ((customer.price_per_appointment || 0) * (customer.appointments_per_month || 0)), 0) / total_appointments;
      }
      
      const calculatedMetrics = {
        total_revenue,
        total_appointments,
        avg_revenue_per_appointment,
        total_recurring_revenue,
        total_setup_revenue,
        customer_count: customersData.length
      };
      
      console.log('Calculated metrics from customer data:', calculatedMetrics);
      return calculatedMetrics;
    }
    
    // If no data at all, return zeros
    console.warn('No data found for metrics calculation');
    return {
      total_revenue: 0,
      total_appointments: 0,
      avg_revenue_per_appointment: 0,
      total_recurring_revenue: 0,
      total_setup_revenue: 0,
      customer_count: 0
    };
    
  } catch (error: any) {
    console.error('Error in getRevenueMetrics:', error);
    toast({
      title: 'Error Loading Metrics',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive'
    });
    
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
