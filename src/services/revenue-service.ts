
import { supabase } from '@/integrations/supabase/client';
import { CustomerRevenue, RevenueMetrics } from '@/types/revenue';
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

    if (error) throw error;
    
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
    
    return data as RevenueMetrics;
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
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

/**
 * Fetch customer revenue data for a period range
 */
export const getCustomerRevenueByPeriod = async (
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): Promise<CustomerRevenue[]> => {
  try {
    const { data, error } = await supabase.rpc('get_customer_revenue_by_period', {
      p_start_year: startYear,
      p_start_month: startMonth,
      p_end_year: endYear,
      p_end_month: endMonth
    });

    if (error) throw error;
    
    return (data as CustomerRevenue[]) || [];
  } catch (error) {
    console.error('Error fetching customer revenue by period:', error);
    return [];
  }
};

/**
 * Save or update customer revenue data
 */
export const upsertCustomerRevenue = async (
  data: CustomerRevenue
): Promise<CustomerRevenue | null> => {
  try {
    // Check if revenue entry exists for this customer/period
    const { data: existingData, error: fetchError } = await supabase
      .from('customer_revenue')
      .select('id')
      .eq('customer_id', data.customer_id)
      .eq('year', data.year)
      .eq('month', data.month)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (existingData?.id) {
      // Update existing record
      const { data: updatedData, error: updateError } = await supabase
        .from('customer_revenue')
        .update({
          setup_fee: data.setup_fee,
          price_per_appointment: data.price_per_appointment,
          appointments_delivered: data.appointments_delivered,
          recurring_fee: data.recurring_fee,
          comments: data.comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return updatedData as CustomerRevenue;
    } else {
      // Insert new record
      const { data: newData, error: insertError } = await supabase
        .from('customer_revenue')
        .insert({
          customer_id: data.customer_id,
          year: data.year,
          month: data.month,
          setup_fee: data.setup_fee,
          price_per_appointment: data.price_per_appointment,
          appointments_delivered: data.appointments_delivered,
          recurring_fee: data.recurring_fee,
          comments: data.comments
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      return newData as CustomerRevenue;
    }
  } catch (error) {
    console.error('Error upserting customer revenue:', error);
    toast({
      title: 'Error',
      description: 'Failed to save revenue data',
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Delete customer revenue data
 */
export const deleteCustomerRevenue = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customer_revenue')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting customer revenue:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete revenue data',
      variant: 'destructive'
    });
    return false;
  }
};
