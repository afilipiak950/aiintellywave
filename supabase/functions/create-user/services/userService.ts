
import { CreateUserPayload } from '../utils/validation.ts';

export async function createAuthUser(supabase: any, payload: CreateUserPayload) {
  console.log('Step 1: Creating user in auth system');
  
  try {
    const { email, name, company_id, role, language } = payload;
    
    const authResult = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm email for testing
      user_metadata: {
        name,
        role, // Store role in user metadata as a string
        company_id,
        language,
      }
    });
    
    if (authResult.error) {
      console.error('Error creating auth user:', JSON.stringify(authResult.error));
      return { 
        success: false, 
        error: `Error creating user: ${authResult.error.message}`,
        status: 500 
      };
    }
    
    if (!authResult.data?.user) {
      console.error('No user data returned from auth.admin.createUser');
      return { 
        success: false, 
        error: 'Failed to create user: No user data returned',
        status: 500
      };
    }
    
    console.log(`User created with ID: ${authResult.data.user.id}`);
    
    return { 
      success: true, 
      userId: authResult.data.user.id, 
      userData: authResult.data 
    };
  } catch (error) {
    console.error('Exception during user creation:', error);
    return { 
      success: false, 
      error: `Exception during user creation: ${error.message}`,
      status: 500
    };
  }
}

export async function addUserToCompany(supabase: any, userId: string, payload: CreateUserPayload) {
  console.log('Step 2: Adding user to company_users table');
  
  try {
    const { email, name, company_id, role } = payload;
    
    const companyUserPayload = {
      user_id: userId,
      company_id,
      role, // Store as plain text string
      is_admin: role === 'admin', // Set is_admin based on role
      email, // Include email for easier access
      full_name: name, // Include name for easier access
    };
    
    console.log('company_users insert payload:', JSON.stringify(companyUserPayload));
    
    const companyUserResult = await supabase
      .from('company_users')
      .insert(companyUserPayload);
    
    if (companyUserResult.error) {
      console.error('Error adding user to company:', JSON.stringify(companyUserResult.error));
      return { 
        success: false, 
        error: companyUserResult.error 
      };
    }
    
    console.log('User added to company_users successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception during company_users insertion:', error);
    return { 
      success: false, 
      error 
    };
  }
}

export async function addUserRole(supabase: any, userId: string, role: string) {
  console.log('Step 3: Adding user to user_roles table');
  
  try {
    // First, check if the user_roles table exists by doing a careful select
    try {
      const tableCheck = await supabase
        .from('user_roles')
        .select('id')
        .limit(1);
      
      // If we get here without error, table exists - try the insert
      if (!tableCheck.error) {
        console.log('user_roles table exists, attempting insert');
        
        const userRolePayload = {
          user_id: userId,
          role // Plain string
        };
        console.log('user_roles insert payload:', JSON.stringify(userRolePayload));
        
        const roleResult = await supabase
          .from('user_roles')
          .insert(userRolePayload);
        
        if (roleResult.error) {
          console.warn('User role assignment had issues:', roleResult.error.message);
          return { 
            success: false, 
            error: roleResult.error 
          };
        }
        
        console.log('Role assignment successful');
        return { success: true };
      }
    } catch (tableError) {
      console.warn('user_roles table might not exist:', tableError.message);
      return { 
        success: false, 
        error: { message: 'user_roles table not accessible' } 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.warn('Error with user_roles operation:', error);
    return { 
      success: false, 
      error
    };
  }
}
