
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Helper function to find best company match based on email domain
const findBestCompanyMatch = (email: string | undefined, companies: any[]) => {
  if (!email || !email.includes('@') || !companies?.length) {
    return null;
  }

  const domain = email.split('@')[1].toLowerCase();
  const domainPrefix = domain.split('.')[0].toLowerCase();
  
  // Try to find best matching company by domain
  for (const company of companies) {
    const companyName = (company.name || '').toLowerCase();
    
    // Exact match
    if (companyName === domainPrefix) {
      console.log(`[findBestCompanyMatch] Exact match: ${company.id} - ${company.name}`);
      return company.id;
    }
    
    // Partial matches
    if (companyName.includes(domainPrefix) || domainPrefix.includes(companyName)) {
      console.log(`[findBestCompanyMatch] Partial match: ${company.id} - ${company.name}`);
      return company.id;
    }
  }
  
  console.log('[findBestCompanyMatch] No match found');
  return null;
};

export const handleProfileSubmit = async (data: any, customerId: string) => {
  console.log('[handleProfileSubmit] Updating profile with data:', data);
  
  try {
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
    
    // If company_id is provided, handle company association
    if (data.company_id) {
      try {
        console.log('[handleProfileSubmit] Handling company association for user:', customerId);
        
        // First check if this company is already associated with the user
        const { data: existingAssociation, error: checkError } = await supabase
          .from('company_users')
          .select('id, company_id')
          .eq('user_id', customerId)
          .eq('company_id', data.company_id)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // Get user's email for use in company association
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', customerId)
          .single();
          
        if (userError) throw userError;
        
        // Get email from auth
        const { data: userData, error: authError } = await supabase.auth.admin.getUserById(customerId);
        if (authError) throw authError;
        
        const userEmail = userData?.user?.email;
        console.log('[handleProfileSubmit] User email:', userEmail);
        
        // Track if we're setting this as the primary company
        const isPrimaryCompany = data.isPrimaryCompany === true;
        console.log('[handleProfileSubmit] Setting as primary company:', isPrimaryCompany);
        
        if (existingAssociation) {
          // If association already exists, update the company details
          console.log('[handleProfileSubmit] Updating existing company association:', existingAssociation.id);
          
          const { error: updateError } = await supabase
            .from('company_users')
            .update({
              role: data.company_role || 'customer',
              is_admin: data.company_role === 'admin',
              is_primary_company: isPrimaryCompany,
              full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
            })
            .eq('id', existingAssociation.id);
            
          if (updateError) throw updateError;
        } else {
          // If no association exists, we need to handle whether the user already has other companies
          const { data: allUserAssociations, error: fetchError } = await supabase
            .from('company_users')
            .select('id, company_id, is_primary_company')
            .eq('user_id', customerId);
            
          if (fetchError) throw fetchError;
          
          if (allUserAssociations && allUserAssociations.length > 0) {
            // If user already has associations, update the first one to the new company
            // This avoids violating the unique constraint on user_id
            const firstAssociation = allUserAssociations[0];
            
            console.log(`[handleProfileSubmit] User has existing associations, updating first one (${firstAssociation.id}) to new company`);
            
            const { error: updateError } = await supabase
              .from('company_users')
              .update({
                company_id: data.company_id,
                role: data.company_role || 'customer',
                is_admin: data.company_role === 'admin',
                is_primary_company: isPrimaryCompany,
                email: userEmail,
                full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
              })
              .eq('id', firstAssociation.id);
              
            if (updateError) throw updateError;
          } else {
            // If no associations at all, create a new one
            console.log('[handleProfileSubmit] Creating new company association');
            
            const { error: createError } = await supabase
              .from('company_users')
              .insert({
                user_id: customerId,
                company_id: data.company_id,
                role: data.company_role || 'customer',
                is_admin: data.company_role === 'admin',
                email: userEmail,
                full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                is_primary_company: isPrimaryCompany
              });
              
            if (createError) throw createError;
          }
        }
      } catch (error) {
        console.error('[handleProfileSubmit] Error managing company association:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('[handleProfileSubmit] Error submitting profile:', error);
    toast({
      title: "Error",
      description: error.message || 'Failed to update profile',
      variant: "destructive"
    });
    throw error;
  }
};
