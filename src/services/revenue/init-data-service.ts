
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Create a sample customer for testing
 */
export const createSampleCustomer = async () => {
  try {
    // Check if we already have customers
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
      
    if (count && count > 0) {
      toast({
        title: 'Info',
        description: 'Sample customers already exist',
      });
      return;
    }
    
    // Create sample customers
    const customers = [
      {
        name: 'Sample Customer 1',
        conditions: '100 € pro Termin, 500 € Setup',
        appointments_per_month: 10,
        monthly_flat_fee: 250,
        start_date: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Sample Customer 2',
        conditions: '150 € pro Termin, 750 € Setup',
        appointments_per_month: 15,
        monthly_flat_fee: 350,
        start_date: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Sample Customer 3',
        conditions: '200 € pro Termin, 1000 € Setup',
        appointments_per_month: 20,
        monthly_flat_fee: 500,
        start_date: new Date().toISOString().split('T')[0]
      }
    ];
    
    // Insert customers in sequence
    for (const customer of customers) {
      const { error } = await supabase
        .from('customers')
        .insert(customer);
        
      if (error) {
        console.error('Error creating sample customer:', error);
        throw error;
      }
    }
    
    toast({
      title: 'Success',
      description: 'Sample customers created successfully',
    });
  } catch (error) {
    console.error('Error creating sample customer:', error);
    toast({
      title: 'Error',
      description: 'Failed to create sample customer',
      variant: 'destructive'
    });
  }
};
