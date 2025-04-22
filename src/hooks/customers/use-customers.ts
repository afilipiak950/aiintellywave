
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/services/types/customerTypes';

type CustomerData = UserData;

export function useCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Fetching all users from auth.users/profiles tables...');
        
        // Get current user to check if admin
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }
        
        // Check if user is admin
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .maybeSingle();
          
        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
        }
        
        const isAdmin = userRoles?.role === 'admin' || 
                      currentUser.email === 'admin@intellywave.de';
        
        console.log(`Current user: ${currentUser.email}, isAdmin: ${isAdmin}`);

        // For admin users, we can try to use the admin API to fetch all users
        if (isAdmin) {
          console.log('Admin user detected, fetching all auth users...');
          
          // Fetch all auth users with admin privileges
          const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // Set a large enough value to get all users
          });

          if (authError) {
            console.error('Error using auth.admin.listUsers API:', authError);
            // Fall back to profiles if admin API fails
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('*');
              
            if (profilesError) {
              console.error('Error fetching profiles fallback:', profilesError);
              throw new Error('Failed to fetch user data. Please check your permissions and RLS policies.');
            }
            
            console.log(`Fetched ${profilesData?.length || 0} profiles as fallback`);
            return profilesData?.map(profile => ({
              id: profile.id,
              user_id: profile.id,
              full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: '', // Profiles don't have email
              contact_email: '',
              role: '',
              is_admin: false,
              company_id: null,
              company_name: '',
              avatar_url: profile.avatar_url,
              created_at: null,
              last_sign_in_at: null
            })) as CustomerData[];
          }

          console.log(`Found ${authUsersData?.users?.length || 0} auth users`);
          
          // Fetch all profiles for additional user information
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            // Continue with what we have from auth.users
          }

          // Create a map for efficient profile lookup
          const profilesMap = new Map();
          if (profilesData) {
            profilesData.forEach(profile => {
              profilesMap.set(profile.id, profile);
            });
          }
          
          // Fetch roles from user_roles table
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id, role');
            
          if (rolesError) {
            console.error('Error fetching user roles:', rolesError);
            // Continue with what we have
          }
          
          // Create a map of user_id to role
          const roleMap = new Map();
          if (rolesData) {
            rolesData.forEach(role => {
              roleMap.set(role.user_id, role.role);
            });
          }
          
          // Fetch company users to get company information
          const { data: companyUsersData, error: companyUsersError } = await supabase
            .from('company_users')
            .select(`
              user_id,
              company_id,
              role,
              companies:company_id (
                id,
                name
              )
            `);
            
          if (companyUsersError) {
            console.error('Error fetching company users:', companyUsersError);
            // Continue with what we have
          }
          
          // Create a map of user_id to company data
          const companyMap = new Map();
          if (companyUsersData) {
            companyUsersData.forEach(cu => {
              companyMap.set(cu.user_id, {
                company_id: cu.company_id,
                company_name: cu.companies?.name || '',
                company_role: cu.role
              });
            });
          }

          // Transform auth users to the expected format
          const formattedCustomers = authUsersData.users.map(user => {
            const profile = profilesMap.get(user.id);
            const userRole = roleMap.get(user.id) || '';
            const companyData = companyMap.get(user.id) || {};
            
            // Get the best name from available sources
            const firstName = user.user_metadata?.first_name || profile?.first_name || '';
            const lastName = user.user_metadata?.last_name || profile?.last_name || '';
            const fullName = user.user_metadata?.full_name || 
                            (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '') ||
                            `${firstName} ${lastName}`.trim() ||
                            user.email.split('@')[0];
            
            return {
              id: user.id,
              user_id: user.id,
              name: fullName, // Use fullName as name
              full_name: fullName,
              first_name: firstName,
              last_name: lastName,
              email: user.email,
              contact_email: user.email,
              role: userRole,
              is_admin: userRole === 'admin',
              company_id: companyData.company_id || null,
              company_name: companyData.company_name || '',
              company: companyData.company_name || '',
              company_role: companyData.company_role || '',
              avatar_url: user.user_metadata?.avatar_url || profile?.avatar_url || '',
              phone: profile?.phone || '',
              position: profile?.position || '',
              is_active: profile?.is_active !== false, // Default to true if undefined
              status: 'active', // Default status
              created_at: user.created_at,
              last_sign_in_at: user.last_sign_in_at
            };
          });

          console.log(`Successfully processed ${formattedCustomers.length} users`);
          return formattedCustomers as CustomerData[];
        } else {
          // Non-admin users can only see users from their company
          console.log('Non-admin user, fetching only company users...');
          
          // Get user's company
          const { data: userCompany, error: companyError } = await supabase
            .from('company_users')
            .select('company_id')
            .eq('user_id', currentUser.id)
            .maybeSingle();
            
          if (companyError) {
            console.error('Error fetching user company:', companyError);
            throw new Error('Failed to determine user company');
          }
          
          const companyId = userCompany?.company_id;
          if (!companyId) {
            console.warn('User has no company association');
            return [];
          }
          
          // Fetch users from the same company
          const { data: companyUsers, error: companyUsersError } = await supabase
            .from('company_users')
            .select(`
              user_id,
              company_id,
              role,
              email,
              full_name,
              first_name,
              last_name,
              avatar_url,
              is_admin,
              companies:company_id (
                id,
                name
              )
            `)
            .eq('company_id', companyId);
            
          if (companyUsersError) {
            console.error('Error fetching company users:', companyUsersError);
            throw new Error('Failed to fetch company users');
          }
          
          console.log(`Found ${companyUsers?.length || 0} users in company ${companyId}`);
          
          // Transform company users to the expected format
          const formattedCustomers = companyUsers.map(cu => {
            return {
              id: cu.user_id,
              user_id: cu.user_id,
              name: cu.full_name || '',
              full_name: cu.full_name || '',
              first_name: cu.first_name || '',
              last_name: cu.last_name || '',
              email: cu.email || '',
              contact_email: cu.email || '',
              role: cu.role || '',
              is_admin: cu.is_admin || false,
              company_id: cu.company_id,
              company_name: cu.companies?.name || '',
              company: cu.companies?.name || '',
              company_role: cu.role || '',
              avatar_url: cu.avatar_url || '',
              status: 'active', // Default status
            };
          });

          console.log(`Successfully processed ${formattedCustomers.length} company users`);
          return formattedCustomers as CustomerData[];
        }
      } catch (error: any) {
        console.error('Error in fetchCustomersData:', error);
        throw error;
      }
    }
  });

  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.full_name?.toLowerCase().includes(searchLower)) ||
      (customer.email?.toLowerCase().includes(searchLower)) ||
      (customer.company_name?.toLowerCase().includes(searchLower)) ||
      (customer.role?.toLowerCase().includes(searchLower))
    );
  });

  return {
    customers: filteredCustomers || [],
    isLoading,
    error,
    loading: isLoading,
    errorMsg: error ? (error as Error).message : null,
    searchTerm,
    setSearchTerm,
    refetch,
    fetchCustomers: refetch,
    debugInfo: {
      totalUsersCount: customers?.length || 0,
      filteredUsersCount: filteredCustomers?.length || 0,
      source: 'auth.users + profiles',
      companyUsersCount: 0,
      companyUsersDiagnostics: {
        status: 'info',
        totalCount: 0,
        data: []
      },
      companyUsersRepair: {
        status: 'info',
        message: 'Showing all users regardless of company associations'
      }
    }
  };
}
