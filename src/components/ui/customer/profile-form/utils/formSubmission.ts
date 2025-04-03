
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
  
  // Check if company association exists before attempting to create it
  if (data.company_id) {
    // First check if the user already has this company association
    const { data: existingAssociation, error: checkError } = await supabase
      .from('company_users')
      .select('id')
      .eq('user_id', customerId)
      .eq('company_id', data.company_id)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingAssociation) {
      // If association exists, just update the role
      const { error: updateError } = await supabase
        .from('company_users')
        .update({
          role: data.company_role || 'customer'
        })
        .eq('user_id', customerId)
        .eq('company_id', data.company_id);
        
      if (updateError) throw updateError;
    } else {
      // Create new company association
      const { error: companyUserError } = await supabase
        .from('company_users')
        .insert({
          user_id: customerId,
          company_id: data.company_id,
          role: data.company_role || 'customer'
        });
        
      if (companyUserError) throw companyUserError;
    }
  }
  
  return true;
};
