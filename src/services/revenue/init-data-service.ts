
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Create a type for our sample customer data
interface SampleCustomer {
  name: string;
  monthly_flat_fee: number;
  price_per_appointment: number;
  appointments_per_month: number;
  setup_fee: number;
}

/**
 * Generate sample customers for demo purposes
 */
export const createSampleCustomer = async (): Promise<boolean> => {
  try {
    console.log('Creating sample customer data...');
    
    // Sample customer data
    const sampleCustomers: SampleCustomer[] = [
      {
        name: 'Sample Company GmbH',
        monthly_flat_fee: 500,
        price_per_appointment: 150,
        appointments_per_month: 5,
        setup_fee: 1000
      },
      {
        name: 'Demo Business AG',
        monthly_flat_fee: 750,
        price_per_appointment: 200,
        appointments_per_month: 3,
        setup_fee: 1500
      },
      {
        name: 'Example Service KG',
        monthly_flat_fee: 300,
        price_per_appointment: 100,
        appointments_per_month: 8,
        setup_fee: 800
      }
    ];
    
    // Select a random customer from our samples
    const randomCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    
    // Insert into customers table
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert(randomCustomer)
      .select('id, name');
      
    if (customerError) {
      console.error('Error creating sample customer:', customerError);
      throw new Error(`Failed to create sample customer: ${customerError.message}`);
    }
    
    if (!customerData || customerData.length === 0) {
      throw new Error('No customer data returned from insert operation');
    }
    
    const customer = customerData[0];
    console.log('Sample customer created:', customer);
    
    toast({
      title: 'Sample Data Created',
      description: `Created sample customer: ${customer.name}`,
    });
    
    return true;
  } catch (error: any) {
    console.error('Error in createSampleCustomer:', error);
    
    toast({
      title: 'Error Creating Sample Data',
      description: error.message || 'An unknown error occurred',
      variant: 'destructive'
    });
    
    return false;
  }
};
