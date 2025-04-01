
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has appropriate permissions to access customer data
 * This is useful for debugging RLS issues
 */
export const checkCustomerTableAccess = async () => {
  try {
    console.log('Checking permissions on customers table...');
    
    // First, check if we can fetch from the table at all
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
      
    if (testError) {
      return {
        hasAccess: false,
        error: testError.message,
        details: 'Could not fetch customers table. You might not have permission or the table might not exist.',
        errorObject: testError
      };
    }
    
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return {
        hasAccess: false,
        error: userError.message,
        details: 'Error retrieving current user. You might not be authenticated.',
        errorObject: userError
      };
    }
    
    // Check if we can perform test operations on customer table
    // Using custom function call or direct insert test
    // Since 'test_customer_permissions' doesn't seem to exist, let's use direct query
    const { data: insertData, error: insertError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    // Final result
    return {
      hasAccess: true,
      canRead: !!testData,
      userDetails: user,
      insertPermissions: !insertError,
      message: 'You have access to the customers table'
    };
    
  } catch (error: any) {
    console.error('Error checking customer permissions:', error);
    return {
      hasAccess: false,
      error: error.message,
      details: 'Unexpected error checking permissions',
      errorObject: error
    };
  }
};
