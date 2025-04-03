
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerDebugInfo, FetchCustomersOptions, FetchCustomersResult } from '../types';
import { checkIsAdminUser } from '../utils';
import { fetchAdminCompanyData, fetchAdminCompanyUsers, repairAdminData } from './admin-service';
import { fetchUserCompanies } from './user-service';
import { transformCustomerData } from './data-transformer';
import { toast } from "@/hooks/use-toast";

/**
 * Main function to fetch customer data based on user role
 */
export async function fetchCustomerData({ 
  userId, 
  userEmail 
}: FetchCustomersOptions): Promise<FetchCustomersResult> {
  // Initialize debug information
  const debug: CustomerDebugInfo = {
    userId,
    userEmail,
    timestamp: new Date().toISOString(),
    checks: []
  };
  
  try {
    console.log('Fetching customers data for user:', userId, userEmail);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Determine if user is admin
    const isAdmin = await checkIsAdminUser(userId, userEmail);
    console.log('User is admin:', isAdmin);
    debug.isAdmin = isAdmin;
    debug.checks.push({ name: 'isAdmin check', result: isAdmin });

    // Special handling for admin@intellywave.de
    const isSpecialAdmin = userEmail === 'admin@intellywave.de';
    debug.isSpecialAdmin = isSpecialAdmin;

    let companiesData: any[] = [];
    let companyUsersData: any[] = [];
    
    // Fetch data based on user role
    if (isAdmin || isSpecialAdmin) {
      console.log('Fetching data for admin user');
      // For admin users, fetch all data
      companiesData = await fetchAdminCompanyData(debug);
      companyUsersData = await fetchAdminCompanyUsers(debug);
      
      console.log('Companies data received:', companiesData?.length);
      console.log('Company users data received:', companyUsersData?.length);
    } else {
      // For regular users, fetch only their related data
      const userData = await fetchUserCompanies(userId, debug);
      companiesData = userData.companiesData;
      companyUsersData = userData.companyUsersData;
    }
    
    // Transform data to Customer objects
    const customers = transformCustomerData(companiesData, companyUsersData);
    debug.finalCustomersCount = customers.length;
    console.log('Final customers count:', customers.length);
    
    // Additional debugging for admin@intellywave.de
    if (isSpecialAdmin && customers.length === 0) {
      debug.specialAdminNote = "This is the special admin@intellywave.de account";
      
      // If admin but no data, try directly inserting a company and user relation for admin
      const repaired = await repairAdminData(userId, userEmail, debug);
      
      // If repair succeeded, try fetching again (but return current empty result to avoid infinite recursion)
      if (repaired) {
        console.log("Admin data repaired, next fetch should succeed");
      }
    }
    
    return { customers, debugInfo: debug };
    
  } catch (error: any) {
    console.error('Error in fetchCustomerData:', error);
    
    let errorMessage = error.message || 'Failed to load customers. Please try again.';
    
    // Special handling for infinite recursion errors
    if (error.message?.includes('infinite recursion')) {
      errorMessage = 'Database policy error: There is an issue with data access permissions. Our team has been notified and is working to fix it.';
      console.warn('Infinite recursion detected in RLS policy. Full error:', error);
    }
    
    debug.error = errorMessage;
    debug.errorDetails = error;
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
    
    return { customers: [], debugInfo: debug };
  }
}
