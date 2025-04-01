
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
    console.log(`Starting customer sync for ${month}/${year}`);
    
    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
    
    if (customersError) {
      console.error('Error fetching customers:', customersError);
      throw customersError;
    }
    
    if (!customers || customers.length === 0) {
      console.log('No customers found to sync');
      return true; // No customers to sync is not an error
    }
    
    console.log(`Found ${customers.length} customers to sync`);
    
    // Process each customer
    let syncedCount = 0;
    let errorCount = 0;
    
    for (const customer of customers) {
      try {
        // Check if revenue entry exists
        const { data: existingEntry, error: checkError } = await supabase
          .from('customer_revenue')
          .select('id')
          .eq('customer_id', customer.id)
          .eq('year', year)
          .eq('month', month)
          .maybeSingle();
        
        if (checkError) {
          console.error(`Error checking existing entry for customer ${customer.id}:`, checkError);
          errorCount++;
          continue;
        }
        
        // If no entry exists, create one with data from customer
        if (!existingEntry) {
          console.log(`Creating revenue entry for customer ${customer.id} (${customer.name})`);
          
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
          
          if (insertError) {
            console.error(`Error creating revenue entry for customer ${customer.id}:`, insertError);
            errorCount++;
          } else {
            syncedCount++;
          }
        } else {
          console.log(`Revenue entry already exists for customer ${customer.id} (${customer.name})`);
        }
      } catch (customerError) {
        console.error(`Error processing customer ${customer.id}:`, customerError);
        errorCount++;
      }
    }
    
    console.log(`Sync completed: ${syncedCount} entries created, ${errorCount} errors`);
    
    if (errorCount > 0) {
      toast({
        title: 'Warning',
        description: `Synchronisierung abgeschlossen mit ${errorCount} Fehlern.`,
        variant: 'default'
      });
      return errorCount < customers.length; // Return true if at least some succeeded
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
