
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const handleProfileSubmit = async (data: any, customerId: string) => {
  // Update the profile in the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      position: data.position
    })
    .eq('id', customerId);
    
  if (profileError) throw profileError;
  
  // If company_id is provided, we need to handle company associations
  if (data.company_id) {
    try {
      // First, check if there are existing company associations for this user
      const { data: existingAssociations, error: fetchError } = await supabase
        .from('company_users')
        .select('id, company_id')
        .eq('user_id', customerId);
        
      if (fetchError) throw fetchError;
      
      // Check if the user is already associated with the selected company
      const existingAssociation = existingAssociations?.find(
        association => association.company_id === data.company_id
      );
      
      if (existingAssociation) {
        // If there's an existing association with this company, just update the role
        const { error: updateError } = await supabase
          .from('company_users')
          .update({ role: data.company_role || 'customer' })
          .eq('id', existingAssociation.id);
          
        if (updateError) throw updateError;
      } else {
        // If there's no association with this company:
        // 1. Delete all existing company associations if they exist
        // 2. Create a new association with the selected company
        
        if (existingAssociations && existingAssociations.length > 0) {
          // Delete existing company associations
          const { error: deleteError } = await supabase
            .from('company_users')
            .delete()
            .eq('user_id', customerId);
            
          if (deleteError) throw deleteError;
        }
        
        // Create new company association
        const { error: createError } = await supabase
          .from('company_users')
          .insert({
            user_id: customerId,
            company_id: data.company_id,
            role: data.company_role || 'customer'
          });
          
        if (createError) throw createError;
      }
    } catch (error) {
      console.error('[handleProfileSubmit] Error managing company association:', error);
      throw error;
    }
  }
  
  return true;
};
