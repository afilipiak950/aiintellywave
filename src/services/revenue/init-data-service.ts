
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Create a sample customer for testing purposes
 */
export const createSampleCustomer = async () => {
  try {
    // Create sample customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: 'Sample Customer ' + new Date().toLocaleDateString('de-DE'),
        conditions: '100€ pro Termin, 200€ Setup',
        appointments_per_month: 10,
        price_per_appointment: 100,
        setup_fee: 200,
        monthly_flat_fee: 50,
        start_date: new Date().toISOString().slice(0, 10)
      })
      .select()
      .single();
      
    if (customerError) {
      throw customerError;
    }
    
    toast({
      title: 'Erfolg',
      description: 'Beispielkunde erstellt',
    });
    
    return customerData;
  } catch (error: any) {
    console.error('Error creating sample customer:', error);
    toast({
      title: 'Fehler',
      description: 'Fehler beim Erstellen des Beispielkunden',
      variant: 'destructive'
    });
    return null;
  }
};
