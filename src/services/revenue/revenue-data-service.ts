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
    
    // Now fetch revenue data
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
    
    // Create a map of customer IDs to names for quick lookup
    const customerMap: Record<string, string> = {};
    customersData.forEach(customer => {
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
