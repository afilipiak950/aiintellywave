
import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';

/**
 * Create or repair admin user company relationship
 */
export async function repairAdminData(userId: string, userEmail: string, debug: CustomerDebugInfo): Promise<boolean> {
  try {
    console.log("No data found for admin, attempting to create company and relationship");
    debug.adminRepairAttempt = true;
    
    // First check if default company exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, name')
      .eq('name', 'Admin Company')
      .maybeSingle();
      
    let companyId;
    
    if (existingCompany) {
      companyId = existingCompany.id;
      console.log("Using existing Admin Company:", companyId);
      debug.adminRepair = { action: "using_existing_company", id: companyId };
    } else {
      // Create a default company for admin
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'Admin Company',
          description: 'Default company for admin',
          contact_email: userEmail
        })
        .select()
        .single();
        
      if (companyError) {
        console.error("Failed to create admin company:", companyError);
        debug.adminRepair = { action: "create_company_failed", error: companyError };
        return false;
      } else {
        companyId = newCompany.id;
        console.log("Created new Admin Company:", companyId);
        debug.adminRepair = { action: "created_company", id: companyId };
      }
    }
    
    if (companyId) {
      // Now ensure admin is linked to this company
      const { error: linkError } = await supabase
        .from('company_users')
        .upsert({
          user_id: userId,
          company_id: companyId,
          role: 'admin',
          is_admin: true,
          email: userEmail,
          full_name: 'Admin User'
        }, { onConflict: 'user_id,company_id' });
        
      if (linkError) {
        console.error("Failed to link admin to company:", linkError);
        debug.adminRepair = { ...debug.adminRepair, link_status: "failed", error: linkError };
        return false;
      } else {
        console.log("Successfully linked admin to company");
        debug.adminRepair = { ...debug.adminRepair, link_status: "success" };
        
        // Also ensure admin role in user_roles
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'admin'
          }, { onConflict: 'user_id,role' });
          
        if (roleError) {
          console.error("Failed to add admin role:", roleError);
          debug.adminRepair = { ...debug.adminRepair, role_status: "failed", error: roleError };
        } else {
          debug.adminRepair = { ...debug.adminRepair, role_status: "success" };
        }
        
        return true;
      }
    }
    return false;
  } catch (repairError) {
    console.error("Error while trying to repair admin data:", repairError);
    debug.adminRepair = { action: "repair_failed", error: repairError };
    return false;
  }
}

/**
 * Fetch all company data for admin users
 */
export async function fetchAdminCompanyData(debug: CustomerDebugInfo) {
  console.log('Fetching all companies for admin user');
  
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      contact_email,
      contact_phone,
      city,
      country,
      description
    `);
    
  if (companiesError) {
    console.error('Error fetching companies:', companiesError);
    debug.errors = debug.errors || [];
    debug.errors.push({ type: 'companies', error: companiesError });
    throw companiesError;
  }
  
  debug.companiesCount = companies?.length || 0;
  console.log('Fetched companies:', debug.companiesCount);
  
  return companies || [];
}

/**
 * Fetch all company users for admin
 */
export async function fetchAdminCompanyUsers(debug: CustomerDebugInfo) {
  console.log('Fetching all company users for admin user');
  
  const { data: allCompanyUsers, error: companyUsersError } = await supabase
    .from('company_users')
    .select(`
      user_id,
      company_id,
      role,
      is_admin,
      email,
      full_name,
      first_name,
      last_name,
      avatar_url,
      companies:company_id (
        id,
        name
      )
    `);
  
  if (companyUsersError) {
    console.error('Error fetching company users:', companyUsersError);
    debug.errors = debug.errors || [];
    debug.errors.push({ type: 'company_users', error: companyUsersError });
    throw companyUsersError;
  }
  
  debug.companyUsersCount = allCompanyUsers?.length || 0;
  console.log('Fetched company users:', debug.companyUsersCount);
  
  return allCompanyUsers || [];
}
