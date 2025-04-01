
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CustomerTableRow {
  id?: string;
  name: string;
  conditions: string;
  appointments_per_month: number;
  price_per_appointment: number;
  setup_fee: number;
  monthly_flat_fee: number;
  monthly_revenue?: number;
  end_date?: string | null;
  start_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function fetchCustomers(): Promise<CustomerTableRow[]> {
  try {
    console.log('Fetching customers from customer-table-service');
    // Use 'customers' table which was created in the SQL migration
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error in fetchCustomers:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} customers in fetchCustomers`);
    
    // Type assertion here since we know the structure matches CustomerTableRow
    return (data as CustomerTableRow[]) || [];
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    toast({
      title: 'Fehler',
      description: 'Kundendaten konnten nicht geladen werden.',
      variant: 'destructive'
    });
    return [];
  }
}

export async function addCustomer(customer: { 
  name: string; 
  conditions: string; 
  appointments_per_month?: number;
  price_per_appointment?: number;
  setup_fee?: number;
  monthly_flat_fee?: number;
  end_date?: string | null;
  start_date?: string | null;
}): Promise<CustomerTableRow | null> {
  try {
    // Set default start date to today if not provided
    const start_date = customer.start_date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        conditions: customer.conditions,
        appointments_per_month: customer.appointments_per_month || 0,
        price_per_appointment: customer.price_per_appointment || 0,
        setup_fee: customer.setup_fee || 0,
        monthly_flat_fee: customer.monthly_flat_fee || 0,
        end_date: customer.end_date || null,
        start_date: start_date
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // After successfully creating the customer, create revenue entries
    if (data) {
      const startDate = new Date(start_date);
      
      // Process start date for setup fee
      const setupYear = startDate.getFullYear();
      const setupMonth = startDate.getMonth() + 1; // JavaScript months are 0-indexed
      
      // Create entry for setup fee in the start month
      await supabase
        .from('customer_revenue')
        .insert({
          customer_id: data.id,
          year: setupYear,
          month: setupMonth,
          setup_fee: data.setup_fee || 0,
          price_per_appointment: data.price_per_appointment || 0,
          appointments_delivered: data.appointments_per_month || 0,
          recurring_fee: data.monthly_flat_fee || 0
        });
      
      // Get current date for future entries
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Create entries for future months (up to 12 months from start date)
      // This ensures that customers always have future entries ready
      for (let i = 0; i < 12; i++) {
        const nextMonthDate = new Date(startDate);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + i + 1);
        const nextMonthYear = nextMonthDate.getFullYear();
        const nextMonth = nextMonthDate.getMonth() + 1;
        
        // Skip if we've gone too far into the future (more than 12 months from current date)
        if (nextMonthYear > currentYear + 1 || 
            (nextMonthYear === currentYear + 1 && nextMonth > currentMonth)) {
          break;
        }
        
        await supabase
          .from('customer_revenue')
          .insert({
            customer_id: data.id,
            year: nextMonthYear,
            month: nextMonth,
            setup_fee: 0, // No setup fee for subsequent months
            price_per_appointment: data.price_per_appointment || 0,
            appointments_delivered: data.appointments_per_month || 0,
            recurring_fee: data.monthly_flat_fee || 0
          });
      }
      
      // Dispatch event to notify components about the update
      window.dispatchEvent(new CustomEvent('customer-revenue-updated'));
    }
    
    toast({
      title: 'Erfolg',
      description: 'Kunde wurde erfolgreich hinzugefügt.',
    });
    
    return data as CustomerTableRow;
  } catch (error: any) {
    console.error('Error adding customer:', error);
    toast({
      title: 'Fehler',
      description: 'Kunde konnte nicht hinzugefügt werden.',
      variant: 'destructive'
    });
    return null;
  }
}

export async function updateCustomer(customer: CustomerTableRow): Promise<boolean> {
  try {
    // First update the customer record
    const { error } = await supabase
      .from('customers')
      .update({
        name: customer.name,
        conditions: customer.conditions,
        appointments_per_month: customer.appointments_per_month,
        price_per_appointment: customer.price_per_appointment,
        setup_fee: customer.setup_fee,
        monthly_flat_fee: customer.monthly_flat_fee,
        end_date: customer.end_date || null,
        start_date: customer.start_date || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id);
    
    if (error) throw error;
    
    // Update all future revenue entries to match the new customer values
    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // First, get all existing revenue entries for this customer from current month onwards
    const { data: existingEntries, error: fetchError } = await supabase
      .from('customer_revenue')
      .select('*')
      .eq('customer_id', customer.id)
      .or(`year.gt.${currentYear},and(year.eq.${currentYear},month.gte.${currentMonth})`);
    
    if (fetchError) throw fetchError;
    
    // Update each entry with the new values from the customer
    for (const entry of (existingEntries || [])) {
      await supabase
        .from('customer_revenue')
        .update({
          price_per_appointment: customer.price_per_appointment,
          appointments_delivered: customer.appointments_per_month,
          recurring_fee: customer.monthly_flat_fee,
          updated_at: new Date().toISOString()
        })
        .eq('id', entry.id);
    }
    
    // Dispatch event to notify components about the update
    window.dispatchEvent(new CustomEvent('customer-revenue-updated'));
    
    toast({
      title: 'Erfolg',
      description: 'Kundendaten wurden aktualisiert.',
    });
    
    return true;
  } catch (error: any) {
    console.error('Error updating customer:', error);
    toast({
      title: 'Fehler',
      description: 'Kundendaten konnten nicht aktualisiert werden.',
      variant: 'destructive'
    });
    return false;
  }
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  try {
    // First, delete all revenue entries for this customer
    const { error: revenueError } = await supabase
      .from('customer_revenue')
      .delete()
      .eq('customer_id', customerId);
      
    if (revenueError) throw revenueError;
    
    // Then delete the customer record
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);
    
    if (error) throw error;
    
    toast({
      title: 'Erfolg',
      description: 'Kunde wurde erfolgreich gelöscht.',
    });
    
    // Dispatch event to notify components about the update
    window.dispatchEvent(new CustomEvent('customer-revenue-updated'));
    
    return true;
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    toast({
      title: 'Fehler',
      description: 'Kunde konnte nicht gelöscht werden.',
      variant: 'destructive'
    });
    return false;
  }
}
