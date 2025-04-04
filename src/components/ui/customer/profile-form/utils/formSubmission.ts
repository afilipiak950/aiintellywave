
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
        
        // Get all existing company associations
        const { data: existingAssociations, error: fetchError } = await supabase
          .from('company_users')
          .select('id, company_id, role, is_admin, email, is_primary_company')
          .eq('user_id', customerId);
        
        if (fetchError) throw fetchError;
        
        // Extract user email from the existing associations
        const userEmail = existingAssociations?.[0]?.email;
        console.log('[handleProfileSubmit] User email:', userEmail);

        // Check if there's an existing association with the selected company
        const existingAssociation = existingAssociations?.find(
          assoc => assoc.company_id === data.company_id
        );
        
        // Track if we're setting this as the primary company
        const isPrimaryCompany = data.isPrimaryCompany === true;
        console.log('[handleProfileSubmit] Setting as primary company:', isPrimaryCompany);
        
        if (isPrimaryCompany) {
          // First, reset is_primary_company flag for all associations
          for (const assoc of existingAssociations || []) {
            console.log(`[handleProfileSubmit] Resetting primary flag for company ${assoc.company_id}`);
            
            const { error: resetError } = await supabase
              .from('company_users')
              .update({ is_primary_company: false })
              .eq('id', assoc.id);
              
            if (resetError) {
              console.warn('[handleProfileSubmit] Error resetting primary company:', resetError);
            }
          }
        }
        
        if (existingAssociation) {
          // If association already exists, update the role and primary flag
          console.log('[handleProfileSubmit] Updating existing company association');
          const { error: updateError } = await supabase
            .from('company_users')
            .update({ 
              role: data.company_role || 'customer',
              is_admin: data.company_role === 'admin',
              is_primary_company: isPrimaryCompany
            })
            .eq('id', existingAssociation.id);
            
          if (updateError) throw updateError;
        } else {
          // If no association with selected company exists, create a new one
          console.log('[handleProfileSubmit] Creating new company association');
          const { error: createError } = await supabase
            .from('company_users')
            .insert({
              user_id: customerId,
              company_id: data.company_id,
              role: data.company_role || 'customer',
              is_admin: data.company_role === 'admin',
              // Preserve the email across all company associations for consistency
              email: userEmail,
              full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
              is_primary_company: isPrimaryCompany
            });
            
          if (createError) throw createError;
        }
        
        // Get all companies for determining the primary company
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name');
          
        if (companiesError) throw companiesError;
        
        // If not explicitly setting primary, check domain match
        if (!isPrimaryCompany) {
          // Find the best company match based on email domain
          const bestCompanyId = findBestCompanyMatch(
            userEmail, 
            companies
          );
          
          console.log('[handleProfileSubmit] Best domain-matched company:', bestCompanyId);
          
          // If domain match found and it's different from current selection, update flags
          if (bestCompanyId && bestCompanyId !== data.company_id) {
            console.log('[handleProfileSubmit] Setting domain-matched company as primary');
            
            // Find the association with this company
            const domainMatchAssoc = existingAssociations?.find(
              assoc => assoc.company_id === bestCompanyId
            );
            
            if (domainMatchAssoc) {
              // Update the domain matched company to be primary
              const { error: updateError } = await supabase
                .from('company_users')
                .update({ is_primary_company: true })
                .eq('id', domainMatchAssoc.id);
                
              if (updateError) {
                console.warn('[handleProfileSubmit] Error updating domain match company:', updateError);
              }
            }
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
