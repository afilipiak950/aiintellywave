
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
    
    // Check if companies exist
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Failed to fetch companies'
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
          description: 'Default company created by repair function'
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
            is_manager_kpi_enabled: false
          }]);
        
        if (assocError) {
          console.error("Error creating company user association:", assocError);
        } else {
          repairs.push({ action: 'created_association', user_id: user.id, company_id: defaultCompanyId });
        }
      } else {
        console.log("User already has company associations");
      }
    }
    
    // Also sync user roles
    await syncUserRoles(user);
    
    // Fetch fresh data after repairs
    const { data: updatedCompanies } = await supabase
      .from('companies')
      .select('*');
    
    const { data: associations } = await supabase
      .from('company_users')
      .select('*');
    
    const response: RepairResponse = {
      status: 'success',
      message: `Repair completed. Found ${updatedCompanies?.length || 0} companies and ${associations?.length || 0} associations.`,
      companies: updatedCompanies || [],
      associations: associations || [],
      repairs: repairs
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
