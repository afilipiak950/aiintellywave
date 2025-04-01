
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
    // First try to get metrics from the function (which might fail due to type issues)
    try {
      const { data, error } = await supabase.rpc('get_revenue_metrics', {
        p_year: year,
        p_month: month
      });

      if (error) throw error;
      
      if (data) {
        // Handle the case where data is an array
        const metricsData = Array.isArray(data) ? data[0] : data;
        return metricsData as RevenueMetrics;
      }
    } catch (error) {
      console.error('Error fetching revenue metrics from function:', error);
      // Fall through to manual calculation
    }
    
    // If function fails, calculate metrics manually from customer_revenue table
    const { data: revenueData, error: revenueError } = await supabase
      .from('customer_revenue')
      .select('*')
      .eq('year', year)
      .eq('month', month);
    
    if (revenueError) throw revenueError;
    
    // Get count of unique customers
    const { count: customerCount, error: countError } = await supabase
      .from('customer_revenue')
      .select('customer_id', { count: 'exact', head: true })
      .eq('year', year)
      .eq('month', month);
    
    if (countError) throw countError;
    
    // Calculate metrics from raw data
    let totalRevenue = 0;
    let totalAppointments = 0;
    let totalRecurringRevenue = 0;
    let totalSetupRevenue = 0;
    
    (revenueData || []).forEach(entry => {
      const appointmentRevenue = (entry.price_per_appointment || 0) * (entry.appointments_delivered || 0);
      const entryTotal = (entry.setup_fee || 0) + appointmentRevenue + (entry.recurring_fee || 0);
      
      totalRevenue += entryTotal;
      totalAppointments += entry.appointments_delivered || 0;
      totalRecurringRevenue += entry.recurring_fee || 0;
      totalSetupRevenue += entry.setup_fee || 0;
    });
    
    const avgRevenuePerAppointment = totalAppointments > 0 
      ? totalRevenue / totalAppointments 
      : 0;
    
    return {
      total_revenue: totalRevenue,
      total_appointments: totalAppointments,
      avg_revenue_per_appointment: avgRevenuePerAppointment,
      total_recurring_revenue: totalRecurringRevenue,
      total_setup_revenue: totalSetupRevenue,
      customer_count: customerCount || 0
    };
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
    // First, fetch all customer revenue entries for the period
    const { data: revenueData, error: revenueError } = await supabase
      .from('customer_revenue')
      .select('*')
      .gte('year', startYear)
      .lte('year', endYear)
      .or(`month.gte.${startMonth},year.gt.${startYear}`)
      .or(`month.lte.${endMonth},year.lt.${endYear}`)
      .order('year', { ascending: true })
      .order('month', { ascending: true });
    
    if (revenueError) throw revenueError;
    
    // Then fetch all customers to get their names
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name');
    
    if (customerError) throw customerError;
    
    // Create a map of customer IDs to names for quick lookup
    const customerMap: Record<string, string> = {};
    customers?.forEach(customer => {
      customerMap[customer.id] = customer.name;
    });
    
    // Transform the data to match the expected format
    const formattedData = (revenueData || []).map(item => {
      const customerName = customerMap[item.customer_id] || 'Unknown';
      
      // Calculate total revenue
      const total = (item.setup_fee || 0) + 
                   ((item.price_per_appointment || 0) * (item.appointments_delivered || 0)) + 
                   (item.recurring_fee || 0);
      
      return {
        ...item,
        customer_name: customerName,
        total_revenue: total
      };
    });
    
    return formattedData as CustomerRevenue[];
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
 * Synchronize customers from customers table to revenue table
 */
export const syncCustomersToRevenue = async (
  year: number,
  month: number
): Promise<boolean> => {
  try {
    console.log(`Syncing customers for ${month}/${year}`);
    
    // Fetch all customers
    const { data: customers, error: fetchError } = await supabase
      .from('customers')
      .select('*');
      
    if (fetchError) throw fetchError;
    
    if (!customers || customers.length === 0) {
      console.log('No customers found to sync');
      return false;
    }
    
    console.log(`Found ${customers.length} customers to sync`);
    
    // For each customer, check if they already have a revenue entry for this month
    for (const customer of customers) {
      // Skip customers with end_date before the current month/year
      if (customer.end_date) {
        const endDate = new Date(customer.end_date);
        const targetDate = new Date(year, month - 1, 1);
        if (endDate < targetDate) {
          console.log(`Skipping customer ${customer.name} as they ended service on ${customer.end_date}`);
          continue;
        }
      }
      
      // Skip customers with start_date after the current month/year
      if (customer.start_date) {
        const startDate = new Date(customer.start_date);
        const targetDateEnd = new Date(year, month, 0); // Last day of month
        if (startDate > targetDateEnd) {
          console.log(`Skipping customer ${customer.name} as they start service on ${customer.start_date}`);
          continue;
        }
      }
      
      // Check if customer already has revenue entry for this month
      const { data: existingEntry, error: checkError } = await supabase
        .from('customer_revenue')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();
        
      if (checkError) {
        console.error(`Error checking existing entry for customer ${customer.id}:`, checkError);
        continue;
      }
      
      if (existingEntry) {
        console.log(`Customer ${customer.name} already has revenue entry for ${month}/${year}`);
        // Update the existing entry with current values from the customer table
        const { error: updateError } = await supabase
          .from('customer_revenue')
          .update({
            price_per_appointment: customer.price_per_appointment || 0,
            appointments_delivered: customer.appointments_per_month || 0,
            recurring_fee: customer.monthly_flat_fee || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
          
        if (updateError) {
          console.error(`Error updating revenue entry for customer ${customer.id}:`, updateError);
        } else {
          console.log(`Updated revenue entry for customer ${customer.name}`);
        }
      } else {
        console.log(`Creating new revenue entry for customer ${customer.name}`);
        // Create a new entry
        const { error: insertError } = await supabase
          .from('customer_revenue')
          .insert({
            customer_id: customer.id,
            year: year,
            month: month,
            setup_fee: 0, // Only apply setup fee for the first month in the future
            price_per_appointment: customer.price_per_appointment || 0,
            appointments_delivered: customer.appointments_per_month || 0,
            recurring_fee: customer.monthly_flat_fee || 0
          });
          
        if (insertError) {
          console.error(`Error inserting revenue entry for customer ${customer.id}:`, insertError);
        } else {
          console.log(`Created revenue entry for customer ${customer.name}`);
        }
      }
    }
    
    toast({
      title: 'Sync Complete',
      description: `Synchronized ${customers.length} customers for ${month}/${year}`,
    });
    
    return true;
  } catch (error) {
    console.error('Error syncing customers to revenue:', error);
    toast({
      title: 'Error',
      description: 'Failed to sync customers to revenue table',
      variant: 'destructive'
    });
    return false;
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
