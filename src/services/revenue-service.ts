
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { CustomerRevenue, RevenueMetrics } from '@/types/revenue';

/**
 * Get revenue metrics for a specific month/year
 */
export const getRevenueMetrics = async (year: number, month: number): Promise<RevenueMetrics> => {
  try {
    const { data, error } = await supabase
      .rpc('get_revenue_metrics', { 
        p_year: year, 
        p_month: month 
      });

    if (error) {
      console.error('Error fetching revenue metrics from function:', error);
      throw error;
    }

    // Handle the case where data might be an array by taking the first element
    // This ensures we're working with a single object to match the RevenueMetrics type
    const metricsData = Array.isArray(data) ? data[0] : data;
    
    return metricsData as RevenueMetrics;
  } catch (error) {
    console.error('Error in getRevenueMetrics:', error);
    // Return default metrics structure on error
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
 * Get customer revenue data by period range
 */
export const getCustomerRevenueByPeriod = async (
  startYear: number, 
  startMonth: number, 
  endYear: number, 
  endMonth: number
): Promise<CustomerRevenue[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_customer_revenue_by_period', { 
        p_start_year: startYear, 
        p_start_month: startMonth, 
        p_end_year: endYear, 
        p_end_month: endMonth 
      });

    if (error) {
      console.error('Error fetching customer revenue by period:', error);
      throw error;
    }

    return data as CustomerRevenue[];
  } catch (error) {
    console.error('Error in getCustomerRevenueByPeriod:', error);
    return [];
  }
};

/**
 * Sync customers from customers table to revenue table
 * This ensures all customers are properly represented in the revenue table
 */
export const syncCustomersToRevenue = async (
  year: number, 
  month: number
): Promise<boolean> => {
  try {
    console.log(`Syncing customers to revenue for ${month}/${year}`);
    
    // 1. Get all customers from customers table
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*');
    
    if (customersError) {
      console.error('Error fetching customers:', customersError);
      throw customersError;
    }
    
    if (!customersData || customersData.length === 0) {
      console.log('No customers found to sync');
      return true;
    }
    
    console.log(`Found ${customersData.length} customers to sync`);
    
    // Get current date to determine sync range
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 2. For each customer, check if they have entries in customer_revenue for their relevant months
    let syncCount = 0;
    for (const customer of customersData) {
      // Skip if customer has an end date in the past
      if (customer.end_date && new Date(customer.end_date) < new Date(year, month - 1, 1)) {
        console.log(`Skipping customer ${customer.id} as their end date ${customer.end_date} is in the past`);
        continue;
      }
      
      // Determine start month/year for this customer
      let startYear = year;
      let startMonth = month;
      
      // If customer has a start_date, use that as the starting point
      if (customer.start_date) {
        const startDate = new Date(customer.start_date);
        startYear = startDate.getFullYear();
        startMonth = startDate.getMonth() + 1;
        
        // Create entry for the start month if it doesn't exist (setup fee applies here)
        const { data: startMonthData, error: startMonthError } = await supabase
          .from('customer_revenue')
          .select('id')
          .eq('customer_id', customer.id)
          .eq('year', startYear)
          .eq('month', startMonth)
          .maybeSingle();
        
        if (startMonthError) {
          console.error(`Error checking start month for customer ${customer.id}:`, startMonthError);
        } else if (!startMonthData) {
          // Create entry for customer's first month (with setup fee)
          const { error: insertStartError } = await supabase
            .from('customer_revenue')
            .insert({
              customer_id: customer.id,
              year: startYear,
              month: startMonth,
              setup_fee: customer.setup_fee || 0,
              price_per_appointment: customer.price_per_appointment || 0,
              appointments_delivered: customer.appointments_per_month || 0,
              recurring_fee: customer.monthly_flat_fee || 0
            });
          
          if (insertStartError) {
            console.error(`Error creating start month revenue for customer ${customer.id}:`, insertStartError);
          } else {
            syncCount++;
          }
        }
      }
      
      // Create entries for current month (user-requested month) if it doesn't exist
      const { data: existingData, error: existingError } = await supabase
        .from('customer_revenue')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();
      
      if (existingError) {
        console.error(`Error checking customer ${customer.id}:`, existingError);
        continue; // Skip to next customer if there's an error
      }
      
      // If customer doesn't have an entry for the requested month, create one
      if (!existingData) {
        // Determine if setup fee applies (only in first month)
        const isFirstMonth = startYear === year && startMonth === month;
        
        const revenueEntry = {
          customer_id: customer.id,
          year,
          month,
          // Only apply setup fee if this is the customer's first month
          setup_fee: isFirstMonth ? (customer.setup_fee || 0) : 0,
          price_per_appointment: customer.price_per_appointment || 0,
          appointments_delivered: customer.appointments_per_month || 0,
          recurring_fee: customer.monthly_flat_fee || 0
        };
        
        const { error: insertError } = await supabase
          .from('customer_revenue')
          .insert(revenueEntry);
        
        if (insertError) {
          console.error(`Error creating revenue entry for customer ${customer.id}:`, insertError);
        } else {
          syncCount++;
        }
      }
    }
    
    console.log(`Successfully synced ${syncCount} customer revenue entries`);
    return true;
  } catch (error) {
    console.error('Error in syncCustomersToRevenue:', error);
    return false;
  }
};

/**
 * Upsert (insert or update) a customer revenue record
 */
export const upsertCustomerRevenue = async (data: CustomerRevenue): Promise<boolean> => {
  try {
    // Calculate total revenue based on provided fields
    const { id, customer_id, year, month, setup_fee, price_per_appointment, appointments_delivered, recurring_fee, comments } = data;
    
    // If id exists, update the record, otherwise insert a new one
    const { error } = await supabase
      .from('customer_revenue')
      .upsert({
        id,
        customer_id,
        year,
        month,
        setup_fee: setup_fee || 0,
        price_per_appointment: price_per_appointment || 0,
        appointments_delivered: appointments_delivered || 0,
        recurring_fee: recurring_fee || 0,
        comments,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error upserting customer revenue:', error);
      throw error;
    }
    
    // Dispatch event to notify other components about the update
    window.dispatchEvent(new CustomEvent('customer-revenue-updated'));
    
    return true;
  } catch (error) {
    console.error('Error in upsertCustomerRevenue:', error);
    return false;
  }
};
