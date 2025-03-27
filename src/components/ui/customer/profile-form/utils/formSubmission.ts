
import { supabase } from '@/integrations/supabase/client';

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
  
  // Update company association in company_users table
  if (data.company_id) {
    const { error: companyUserError } = await supabase
      .from('company_users')
      .upsert({
        user_id: customerId,
        company_id: data.company_id,
        role: data.company_role || 'customer'
      }, {
        onConflict: 'user_id, company_id'
      });
      
    if (companyUserError) throw companyUserError;
  }
  
  return true;
};
