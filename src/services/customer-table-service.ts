
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
  start_date?: string | null; // Added start_date field
  created_at?: string;
  updated_at?: string;
}

export async function fetchCustomers(): Promise<CustomerTableRow[]> {
  try {
    // Use 'customers' table which was created in the SQL migration
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
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
      
      // Create entry for the next month with recurring fee but no setup fee
      const nextMonthDate = new Date(startDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthYear = nextMonthDate.getFullYear();
      const nextMonth = nextMonthDate.getMonth() + 1;
      
      await supabase
        .from('customer_revenue')
        .insert({
          customer_id: data.id,
          year: nextMonthYear,
          month: nextMonth,
          setup_fee: 0, // No setup fee for next month
          price_per_appointment: data.price_per_appointment || 0,
          appointments_delivered: data.appointments_per_month || 0,
          recurring_fee: data.monthly_flat_fee || 0
        });
      
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
    const { error } = await supabase
      .from('customers')
      .update({
        name: customer.name,
        conditions: customer.conditions,
        appointments_per_month: customer.appointments_per_month,
        price_per_appointment: customer.price_per_appointment,
        setup_fee: customer.setup_fee,
        monthly_flat_fee: customer.monthly_flat_fee,
        end_date: customer.end_date || null, // Added end_date field
        start_date: customer.start_date || null, // Added start_date field
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id);
    
    if (error) throw error;
    
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
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);
    
    if (error) throw error;
    
    toast({
      title: 'Erfolg',
      description: 'Kunde wurde erfolgreich gelöscht.',
    });
    
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
