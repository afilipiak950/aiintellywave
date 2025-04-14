
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Create a Supabase client with the Auth context of the function
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface RepairResponse {
  status: string;
  companies: any[];
  message: string;
  associations: any[];
  repairs: any[];
  diagnostics?: any;
}

serve(async (req) => {
  try {
    console.log("Running repair-company-associations function");
    
    // Get auth user from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User not authenticated:", userError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Authentication failed'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`User authenticated: ${user.id} (${user.email})`);
    
    // Gather diagnostic information first
    const diagnostics = await gatherDiagnostics(user.id);
    
    // Check if companies exist
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Failed to fetch companies',
        diagnostics
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Found ${companies?.length || 0} companies`);
    
    let repairs = [];
    let defaultCompanyId = null;
    
    // If no companies exist, create a default one
    if (!companies || companies.length === 0) {
      console.log("No companies found, creating a default company");
      
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([{ 
          name: 'Default Company', 
          contact_email: user.email,
          description: 'Default company created by repair function',
          enable_search_strings: true
        }])
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating default company:", createError);
      } else {
        console.log("Created default company:", newCompany);
        defaultCompanyId = newCompany.id;
        repairs.push({ action: 'created_company', company: newCompany });
      }
    } else {
      // Use the first company as the default
      defaultCompanyId = companies[0].id;
      console.log(`Selected default company: ${companies[0].name} (${defaultCompanyId})`);
    }
    
    // Check for user associations
    if (defaultCompanyId) {
      // Check if the user already has a company association
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('company_users')
        .select('*')
        .eq('user_id', user.id);
      
      if (userCompanyError) {
        console.error("Error checking user company association:", userCompanyError);
      } else if (!userCompany || userCompany.length === 0) {
        console.log("User has no company association, creating one");
        
        // Extract user metadata
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        const fullName = user.user_metadata?.full_name || `${firstName} ${lastName}`.trim();
        
        // Create association with default company
        const { data: newAssoc, error: assocError } = await supabase
          .from('company_users')
          .insert([{
            user_id: user.id,
            company_id: defaultCompanyId,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            role: user.email === 'admin@intellywave.de' ? 'admin' : 'customer',
            is_admin: user.email === 'admin@intellywave.de',
            is_manager_kpi_enabled: false,
            is_primary_company: true
          }]);
        
        if (assocError) {
          console.error("Error creating company user association:", assocError);
        } else {
          repairs.push({ action: 'created_association', user_id: user.id, company_id: defaultCompanyId });
        }
      } else {
        console.log("User already has company associations:", userCompany.length);
        
        // If multiple associations exist but none is marked as primary, mark the first one
        if (userCompany.length > 0 && !userCompany.some(uc => uc.is_primary_company)) {
          const { error: updateError } = await supabase
            .from('company_users')
            .update({ is_primary_company: true })
            .eq('id', userCompany[0].id);
          
          if (updateError) {
            console.error("Error updating primary company flag:", updateError);
          } else {
            repairs.push({ action: 'marked_primary', company_id: userCompany[0].company_id });
          }
        }
      }
    }
    
    // Also sync user roles
    await syncUserRoles(user);
    
    // Ensure company features are set up
    await ensureCompanyFeatures(defaultCompanyId);
    
    // Fetch fresh data after repairs
    const { data: updatedCompanies } = await supabase
      .from('companies')
      .select('*');
    
    const { data: associations } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', user.id);
    
    const response: RepairResponse = {
      status: 'success',
      message: `Repair completed. Found ${updatedCompanies?.length || 0} companies and ${associations?.length || 0} associations.`,
      companies: updatedCompanies || [],
      associations: associations || [],
      repairs: repairs,
      diagnostics
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Helper to ensure user roles are properly set
async function syncUserRoles(user: any) {
  try {
    // Check if user has a role in user_roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);
    
    if (roleError) {
      console.error("Error checking user roles:", roleError);
      return;
    }
    
    // If the user has no roles, set a default one
    if (!userRoles || userRoles.length === 0) {
      const defaultRole = user.email === 'admin@intellywave.de' ? 'admin' : 'customer';
      
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: user.id,
          role: defaultRole
        }]);
      
      if (insertError) {
        console.error("Error inserting user role:", insertError);
      } else {
        console.log(`Created user role: ${defaultRole} for user ${user.id}`);
      }
    } else {
      console.log(`User already has roles: ${userRoles.map(r => r.role).join(', ')}`);
    }
  } catch (error) {
    console.error("Error in syncUserRoles:", error);
  }
}

// Helper to ensure company features are set up
async function ensureCompanyFeatures(companyId: string | null) {
  if (!companyId) return;
  
  try {
    // Check if company features exist
    const { data: features, error: featuresError } = await supabase
      .from('company_features')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (featuresError) {
      console.error("Error checking company features:", featuresError);
      return;
    }
    
    // If no features record exists, create one
    if (!features) {
      console.log(`No features record for company ${companyId}, creating one`);
      
      const { error: insertError } = await supabase
        .from('company_features')
        .insert([{
          company_id: companyId,
          google_jobs_enabled: true  // Enable by default during repair
        }]);
      
      if (insertError) {
        console.error("Error creating company features:", insertError);
      } else {
        console.log(`Created company features for ${companyId}`);
      }
    } else {
      console.log(`Company features for ${companyId} already exist`);
    }
  } catch (error) {
    console.error("Error in ensureCompanyFeatures:", error);
  }
}

// Gather diagnostic information about the user
async function gatherDiagnostics(userId: string) {
  const diagnostics = {
    user_id: userId,
    auth_user: null as any,
    company_users: null as any,
    user_roles: null as any,
    profiles: null as any,
    companies: null as any,
    company_features: null as any
  };
  
  try {
    // Get auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (!authError) {
      diagnostics.auth_user = {
        id: authUser.user.id,
        email: authUser.user.email,
        created_at: authUser.user.created_at
      };
    }
    
    // Get company_users
    const { data: companyUsers, error: companyError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId);
    
    diagnostics.company_users = companyError ? { error: companyError.message } : companyUsers;
    
    // Get user_roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    diagnostics.user_roles = rolesError ? { error: rolesError.message } : userRoles;
    
    // Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    diagnostics.profiles = profilesError ? { error: profilesError.message } : profiles;
    
    // Get companies (if user has company_users)
    if (companyUsers && companyUsers.length > 0) {
      const companyIds = companyUsers.map(cu => cu.company_id);
      
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);
      
      diagnostics.companies = companiesError ? { error: companiesError.message } : companies;
      
      // Get company features
      const { data: features, error: featuresError } = await supabase
        .from('company_features')
        .select('*')
        .in('company_id', companyIds);
      
      diagnostics.company_features = featuresError ? { error: featuresError.message } : features;
    }
  } catch (error) {
    console.error("Error gathering diagnostics:", error);
  }
  
  return diagnostics;
}
