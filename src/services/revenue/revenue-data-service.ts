
import { supabase } from '@/integrations/supabase/client';
import { CustomerRevenue } from '@/types/revenue';
import { toast } from '@/hooks/use-toast';

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
    console.log(`Fetching revenue data from ${startMonth}/${startYear} to ${endMonth}/${endYear}`);
    
    // Check if there are any valid customers first
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('id, name')
      .not('id', 'is', null);
    
    if (customersError) {
      console.error('Error checking for valid customers:', customersError);
      throw customersError;
    }
    
    // If no customers exist, return empty array
    if (!customersData || customersData.length === 0) {
      console.log('No customers found, returning empty revenue array');
      return [];
    }
    
    // Create a map of customer IDs to names for quick lookup
    const customerMap: Record<string, string> = {};
    customersData.forEach(customer => {
      customerMap[customer.id] = customer.name;
    });
    
    // Now fetch revenue data with more specific filters
    const { data: revenueData, error: revenueError } = await supabase
      .from('customer_revenue')
      .select('*')
      .gte('year', startYear)
      .lte('year', endYear)
      .or(`month.gte.${startMonth},year.gt.${startYear}`)
      .or(`month.lte.${endMonth},year.lt.${endYear}`)
      .order('year', { ascending: true })
      .order('month', { ascending: true });
    
    if (revenueError) {
      console.error('Error fetching customer revenue data:', revenueError);
      throw revenueError;
    }
    
    console.log(`Fetched ${revenueData?.length || 0} revenue entries`);
    
    // If we have no revenue data but have customers, let's try to initialize it
    if ((!revenueData || revenueData.length === 0) && customersData.length > 0) {
      console.log('No revenue data found, but customers exist. Initializing revenue data...');
      return await initializeRevenueData(customersData, customerMap, startYear, endYear);
    }
    
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
 * Initialize revenue data from customers when no revenue data exists
 */
const initializeRevenueData = async (
  customers: any[],
  customerMap: Record<string, string>,
  startYear: number,
  endYear: number
): Promise<CustomerRevenue[]> => {
  try {
    const result: CustomerRevenue[] = [];
    const batch: any[] = [];
    
    for (const customer of customers) {
      // For each customer, create entries for all months in the range
      for (let year = startYear; year <= endYear; year++) {
        for (let month = 1; month <= 12; month++) {
          // Calculate revenue based on customer data
          const isFirstMonth = year === startYear && month === 1;
          const setupFee = isFirstMonth ? (customer.setup_fee || 0) : 0;
          const pricePerAppointment = customer.price_per_appointment || 0;
          const appointmentsPerMonth = customer.appointments_per_month || 0;
          const monthlyFlatFee = customer.monthly_flat_fee || 0;
          
          const entry = {
            customer_id: customer.id,
            year: year,
            month: month,
            setup_fee: setupFee,
            price_per_appointment: pricePerAppointment,
            appointments_delivered: appointmentsPerMonth,
            recurring_fee: monthlyFlatFee
          };
          
          // Add to batch for database insert
          batch.push(entry);
          
          // Add to result with calculated total for immediate display
          const total = setupFee + (pricePerAppointment * appointmentsPerMonth) + monthlyFlatFee;
          result.push({
            ...entry,
            customer_name: customerMap[customer.id] || 'Unknown',
            total_revenue: total,
            id: `temp-${customer.id}-${year}-${month}` // Temporary ID
          });
        }
      }
    }
    
    // Only try to insert if we have data to insert
    if (batch.length > 0) {
      try {
        // Insert in batches to avoid overwhelming the database
        for (let i = 0; i < batch.length; i += 50) {
          const chunk = batch.slice(i, i + 50);
          console.log(`Inserting batch ${i/50 + 1} of ${Math.ceil(batch.length/50)}`);
          
          const { error } = await supabase
            .from('customer_revenue')
            .upsert(chunk, {
              onConflict: 'customer_id,year,month',
              ignoreDuplicates: false
            });
            
          if (error) {
            console.error('Error inserting revenue data batch:', error);
          }
        }
      } catch (error) {
        console.error('Error batch inserting revenue data:', error);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error initializing revenue data:', error);
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
    // First check if the customer exists
    const { data: customerExists, error: customerCheckError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', data.customer_id)
      .single();
      
    if (customerCheckError || !customerExists) {
      console.error('Customer does not exist, cannot update revenue:', data.customer_id);
      toast({
        title: 'Fehler',
        description: 'Der Kunde existiert nicht in der Datenbank',
        variant: 'destructive'
      });
      return null;
    }
    
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
  } catch (error: any) {
    console.error('Error upserting customer revenue:', error);
    
    // Check for foreign key violation and provide a specific message
    if (error.code === '23503') {
      toast({
        title: 'Fehler',
        description: 'Dieser Kunde existiert nicht oder wurde gelöscht.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern der Umsatzdaten',
        variant: 'destructive'
      });
    }
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
      title: 'Fehler',
      description: 'Fehler beim Löschen der Umsatzdaten',
      variant: 'destructive'
    });
    return false;
  }
};

/**
 * Sync customers table data to revenue table for a specific year/month
 */
export const syncCustomersToRevenue = async (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<boolean> => {
  try {
    console.log(`Syncing customers to revenue table for ${month}/${year}`);
    
    // Fetch all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
      
    if (customersError) {
      throw customersError;
    }
    
    if (!customers || customers.length === 0) {
      console.log('No customers found to sync');
      return false;
    }
    
    console.log(`Found ${customers.length} customers to sync`);
    
    // Prepare batch data for the customer revenue table
    const batch = customers.map(customer => ({
      customer_id: customer.id,
      year: year,
      month: month,
      // Only include setup fee for new customers or first month
      setup_fee: month === 1 ? (customer.setup_fee || 0) : 0,
      price_per_appointment: customer.price_per_appointment || 0,
      appointments_delivered: customer.appointments_per_month || 0,
      recurring_fee: customer.monthly_flat_fee || 0,
      updated_at: new Date().toISOString()
    }));
    
    // Upsert the data to ensure existing entries are updated
    const { error } = await supabase
      .from('customer_revenue')
      .upsert(batch, {
        onConflict: 'customer_id,year,month',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error syncing customers to revenue:', error);
      throw error;
    }
    
    console.log('Successfully synced customers to revenue table');
    return true;
  } catch (error) {
    console.error('Error in syncCustomersToRevenue:', error);
    return false;
  }
};
