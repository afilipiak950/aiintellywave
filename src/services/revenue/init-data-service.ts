
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Creates a sample customer for demonstration purposes
 */
export const createSampleCustomer = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: 'Sample Customer',
        conditions: 'Standardbedingungen - 200€ pro Termin, 1000€ Setup',
        price_per_appointment: 200,
        appointments_per_month: 10,
        setup_fee: 1000,
        monthly_flat_fee: 300,
        start_date: new Date().toISOString().split('T')[0]
      });
    
    if (error) {
      console.error('Error creating sample customer:', error);
      toast({
        title: 'Fehler',
        description: 'Sample Kunde konnte nicht erstellt werden',
        variant: 'destructive'
      });
      return false;
    }
    
    toast({
      title: 'Erfolg',
      description: 'Sample Kunde wurde erfolgreich erstellt',
    });
    
    return true;
  } catch (error) {
    console.error('Error in createSampleCustomer:', error);
    toast({
      title: 'Fehler',
      description: 'Unerwarteter Fehler beim Erstellen des Sample Kunden',
      variant: 'destructive'
    });
    return false;
  }
};
