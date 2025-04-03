
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const handleProfileSubmit = async (data: any, customerId: string) => {
  console.log('[handleProfileSubmit] Updating profile with data:', data);
  
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
  
  // If company_id is provided, we need to handle company association
  if (data.company_id) {
    try {
      console.log('[handleProfileSubmit] Handling company association for user:', customerId);
      
      // Check if there's an existing association with the selected company
      const { data: existingAssociation, error: checkError } = await supabase
        .from('company_users')
        .select('id')
        .eq('user_id', customerId)
        .eq('company_id', data.company_id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingAssociation) {
        // If association already exists, just update the role
        console.log('[handleProfileSubmit] Updating existing company association');
        const { error: updateError } = await supabase
          .from('company_users')
          .update({ 
            role: data.company_role || 'customer',
            is_admin: data.company_role === 'admin'
          })
          .eq('id', existingAssociation.id);
          
        if (updateError) throw updateError;
      } else {
        // If no association with selected company exists:
        // First, delete any existing company associations (enforce one company per user)
        console.log('[handleProfileSubmit] Removing previous company associations');
        const { error: deleteError } = await supabase
          .from('company_users')
          .delete()
          .eq('user_id', customerId);
          
        if (deleteError) throw deleteError;
        
        // Then create a new association with the selected company
        console.log('[handleProfileSubmit] Creating new company association');
        const { error: createError } = await supabase
          .from('company_users')
          .insert({
            user_id: customerId,
            company_id: data.company_id,
            role: data.company_role || 'customer',
            is_admin: data.company_role === 'admin'
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
