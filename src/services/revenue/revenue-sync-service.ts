
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CustomerTableRow } from '@/services/customer-table-service';

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
      toast({
        title: 'Information',
        description: 'Keine Kunden zum Synchronisieren gefunden.',
        variant: 'default'
      });
      return true; // No customers to sync is not an error
    }
    
    console.log(`Found ${customers.length} customers to sync`);
    
    // Process each customer
    let syncedCount = 0;
    let errorCount = 0;
    let alreadyExistCount = 0;
    let skippedCount = 0;
    
    const promises = customers.map(async (customer: CustomerTableRow) => {
      try {
        // Check if customer's start_date is after the current sync period
        if (customer.start_date) {
          const startDate = new Date(customer.start_date);
          const syncDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
          
          if (startDate > syncDate) {
            console.log(`Skipping customer ${customer.id} (${customer.name}) - start date (${customer.start_date}) is after sync period (${month}/${year})`);
            return { success: true, skipped: true };
          }
        }
        
        // Check if customer's end_date is before the current sync period
        if (customer.end_date) {
          const endDate = new Date(customer.end_date);
          const syncDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
          
          if (endDate < syncDate) {
            console.log(`Skipping customer ${customer.id} (${customer.name}) - end date (${customer.end_date}) is before sync period (${month}/${year})`);
            return { success: true, skipped: true };
          }
        }
        
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
          return { success: false, error: checkError };
        }
        
        // If no entry exists, create one with data from customer
        if (!existingEntry) {
          console.log(`Creating revenue entry for customer ${customer.id} (${customer.name})`);
          
          const { data, error: insertError } = await supabase
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
            })
            .select('id')
            .single();
          
          if (insertError) {
            console.error(`Error creating revenue entry for customer ${customer.id}:`, insertError);
            return { success: false, error: insertError };
          }
          
          return { success: true, created: true };
        } else {
          console.log(`Revenue entry already exists for customer ${customer.id} (${customer.name})`);
          return { success: true, created: false };
        }
      } catch (customerError) {
        console.error(`Error processing customer ${customer.id}:`, customerError);
        return { success: false, error: customerError };
      }
    });
    
    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    
    // Count results
    results.forEach(result => {
      if (!result.success) {
        errorCount++;
      } else if (result.skipped) {
        skippedCount++;
      } else if (result.created) {
        syncedCount++;
      } else {
        alreadyExistCount++;
      }
    });
    
    console.log(`Sync completed: ${syncedCount} entries created, ${alreadyExistCount} already existed, ${skippedCount} skipped (outside date range), ${errorCount} errors`);
    
    if (errorCount > 0) {
      toast({
        title: 'Warnung',
        description: `Synchronisierung abgeschlossen mit ${errorCount} Fehlern. ${syncedCount} Einträge erstellt.`,
        variant: 'default'
      });
      return errorCount < customers.length; // Return true if at least some succeeded
    }
    
    toast({
      title: 'Erfolg',
      description: syncedCount > 0 
        ? `${syncedCount} Kunden wurden mit der Umsatztabelle synchronisiert.` 
        : `Alle Kunden sind bereits synchronisiert. ${skippedCount} Kunden übersprungen (außerhalb des Datumbereichs).`,
      variant: syncedCount > 0 ? 'default' : 'default'
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
