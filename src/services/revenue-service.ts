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
    
    // Handle the case where data is an array by taking the first element
    // This ensures we're working with a single object to match the RevenueMetrics type
    const metricsData = Array.isArray(data) ? data[0] : data;
    return metricsData as RevenueMetrics;
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

/**
 * Sync all customers to revenue table for current month/year
 * Creates entries for customers that don't have revenue entries for the specified period
 */
export const syncCustomersToRevenue = async (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<boolean> => {
  try {
    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
    
    if (customersError) throw customersError;
    
    // For each customer, check if they have a revenue entry for the specified month/year
    for (const customer of customers) {
      // Check if revenue entry exists
      const { data: existingEntry, error: checkError } = await supabase
        .from('customer_revenue')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // If no entry exists, create one with data from customer
      if (!existingEntry) {
        const { error: insertError } = await supabase
          .from('customer_revenue')
          .insert({
            customer_id: customer.id,
            year: year,
            month: month,
            setup_fee: customer.setup_fee || 0,
            price_per_appointment: customer.price_per_appointment || 0,
            appointments_delivered: customer.appointments_per_month || 0,
            recurring_fee: customer.monthly_flat_fee || 0,
            comments: `Auto-generated from customer data on ${new Date().toLocaleDateString()}`
          });
        
        if (insertError) throw insertError;
      }
    }
    
    toast({
      title: 'Erfolg',
      description: 'Alle Kunden wurden mit der Umsatztabelle synchronisiert.',
    });
    
    return true;
  } catch (error) {
    console.error('Error syncing customers to revenue:', error);
    toast({
      title: 'Fehler',
      description: 'Synchronisierung der Kundendaten fehlgeschlagen.',
      variant: 'destructive'
    });
    return false;
  }
};
