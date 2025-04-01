
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
      console.error('Error checking customer table access:', testError);
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
      console.error('Error getting current user:', userError);
      return {
        hasAccess: false,
        error: userError.message,
        details: 'Error retrieving current user. You might not be authenticated.',
        errorObject: userError
      };
    }
    
    // Check if we can perform additional test operations on the customer table
    const { data: revenueData, error: revenueError } = await supabase
      .from('customer_revenue')
      .select('id')
      .limit(1);
      
    // Return comprehensive result
    return {
      hasAccess: true,
      canRead: !!testData,
      canReadRevenue: !revenueError && !!revenueData,
      userDetails: user,
      message: 'You have access to the customer tables'
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
