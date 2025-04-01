
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Sync all customers to revenue table for current month/year
 * Creates entries for customers that don't have revenue entries for the specified period
 */
export const syncCustomersToRevenue = async (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<boolean> => {
  try {
    console.log(`Starting customer sync for ${month}/${year}`);
    
    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
    
    if (customersError) {
      console.error('Error fetching customers:', customersError);
      throw customersError;
    }
    
    if (!customers || customers.length === 0) {
      console.log('No customers found to sync');
      return true; // No customers to sync is not an error
    }
    
    console.log(`Found ${customers.length} customers to sync`);
    
    // Process each customer
    let syncedCount = 0;
    let errorCount = 0;
    
    for (const customer of customers) {
      try {
        // Check if revenue entry exists
        const { data: existingEntry, error: checkError } = await supabase
          .from('customer_revenue')
          .select('id')
          .eq('customer_id', customer.id)
          .eq('year', year)
          .eq('month', month)
          .maybeSingle();
        
        if (checkError) {
          console.error(`Error checking existing entry for customer ${customer.id}:`, checkError);
          errorCount++;
          continue;
        }
        
        // If no entry exists, create one with data from customer
        if (!existingEntry) {
          console.log(`Creating revenue entry for customer ${customer.id} (${customer.name})`);
          
          const { error: insertError } = await supabase
            .from('customer_revenue')
            .insert({
              customer_id: customer.id,
              year: year,
              month: month,
              setup_fee: customer.setup_fee || 0,
              price_per_appointment: customer.price_per_appointment || 0,
              appointments_delivered: customer.appointments_per_month || 0,
              recurring_fee: customer.monthly_flat_fee || 0,
              comments: `Auto-generated from customer data on ${new Date().toLocaleDateString()}`
            });
          
          if (insertError) {
            console.error(`Error creating revenue entry for customer ${customer.id}:`, insertError);
            errorCount++;
          } else {
            syncedCount++;
          }
        } else {
          console.log(`Revenue entry already exists for customer ${customer.id} (${customer.name})`);
        }
      } catch (customerError) {
        console.error(`Error processing customer ${customer.id}:`, customerError);
        errorCount++;
      }
    }
    
    console.log(`Sync completed: ${syncedCount} entries created, ${errorCount} errors`);
    
    if (errorCount > 0) {
      toast({
        title: 'Warning',
        description: `Synchronisierung abgeschlossen mit ${errorCount} Fehlern.`,
        variant: 'default'
      });
      return errorCount < customers.length; // Return true if at least some succeeded
    }
    
    toast({
      title: 'Erfolg',
      description: 'Alle Kunden wurden mit der Umsatztabelle synchronisiert.',
    });
    
    return true;
  } catch (error) {
    console.error('Error syncing customers to revenue:', error);
    toast({
      title: 'Fehler',
      description: 'Synchronisierung der Kundendaten fehlgeschlagen.',
      variant: 'destructive'
    });
    return false;
  }
};
