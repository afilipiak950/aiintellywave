
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CustomerTableRow {
  id?: string;
  name: string;
  conditions: string;
  appointments_per_month: number;
  price_per_appointment: number;
  setup_fee: number;
  monthly_revenue?: number;
  created_at?: string;
  updated_at?: string;
}

export async function fetchCustomers(): Promise<CustomerTableRow[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
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

export async function addCustomer(customer: { name: string; conditions: string; appointments_per_month?: number }): Promise<CustomerTableRow | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        conditions: customer.conditions,
        appointments_per_month: customer.appointments_per_month || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: 'Erfolg',
      description: 'Kunde wurde erfolgreich hinzugefügt.',
    });
    
    return data;
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
        // We don't update price_per_appointment and setup_fee directly as they're automatically parsed
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
