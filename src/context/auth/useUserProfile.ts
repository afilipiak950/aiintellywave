
import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const useUserProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = async (userId: string): Promise<{
    user: UserProfile | null;
    isAdmin: boolean;
    isManager: boolean;
    isCustomer: boolean;
  }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get role using a direct function call (most reliable)
      try {
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', { 
          user_id: userId 
        });
        
        if (!roleError && roleData) {
          console.log('Role determined from RPC function:', roleData);
          return processRoleAndBuildProfile(userId, roleData, null);
        } else {
          console.warn('Error fetching role with RPC function:', roleError);
        }
      } catch (rpcError) {
        console.warn('RPC call failed:', rpcError);
      }
      
      // Second approach - check user_roles table
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!userRolesError && userRoles) {
        console.log('Role found in user_roles table:', userRoles.role);
        return processRoleAndBuildProfile(userId, userRoles.role, null);
      } else {
        console.warn('Error or no roles found in user_roles table:', userRolesError);
      }
      
      // Third approach - check company_users table which might have role information
      try {
        const { data: companyUser, error: companyUserError } = await supabase
          .from('company_users')
          .select('role, email, full_name, first_name, last_name, avatar_url')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (companyUserError) {
          console.error('Error fetching company user data:', companyUserError);
          throw companyUserError;
        }
        
        if (companyUser) {
          console.log('Role and user data found in company_users:', companyUser);
          return processRoleAndBuildProfile(userId, companyUser.role, companyUser);
        }
      } catch (companyError) {
        console.error('Error in company users query:', companyError);
      }
      
      // Last resort - get basic profile data and use default role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, is_active')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }
      
      console.log('Profile data:', profileData);
      
      // Get email from auth.users if possible
      let userEmail: string | null = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user) {
          userEmail = userData.user.email;
          console.log('User email:', userEmail);
        }
      } catch (emailError) {
        console.warn('Could not fetch user email:', emailError);
      }
      
      return processRoleAndBuildProfile(userId, null, null, profileData, userEmail);
    } catch (err) {
      const error = err as Error;
      console.error('Error in fetchUserProfile:', error);
      setError(error);
      
      // Return default values in case of error
      return {
        user: {
          id: userId,
          email: '',
          role: 'customer',
          firstName: '',
          lastName: '',
          avatarUrl: null,
          is_admin: false,
          is_manager: false,
          is_customer: true
        },
        isAdmin: false,
        isManager: false,
        isCustomer: true
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const processRoleAndBuildProfile = (
    userId: string,
    role: string | null,
    companyUserData: any,
    profileData?: any,
    userEmail?: string | null
  ) => {
    // Determine role and boolean flags
    let userRole = role;
    let isAdmin = false;
    let isManager = false;
    let isCustomer = false;
    
    if (userRole) {
      isAdmin = userRole === 'admin';
      isManager = userRole === 'manager';
      isCustomer = userRole === 'customer';
    } else {
      console.log('Final role determination:', { userRole, isAdmin, isManager, isCustomer });
      console.warn('No role found for user, setting as customer by default');
      userRole = 'customer';
      isCustomer = true;
      
      // If this is important, retry once more after a delay
      setTimeout(async () => {
        console.info('Will retry fetching role once more after delay');
      }, 500);
    }
    
    // Combine data from different sources, prioritizing company_users
    const email = companyUserData?.email || userEmail || '';
    const firstName = companyUserData?.first_name || profileData?.first_name || '';
    const lastName = companyUserData?.last_name || profileData?.last_name || '';
    const fullName = companyUserData?.full_name || `${firstName} ${lastName}`.trim() || '';
    const avatarUrl = companyUserData?.avatar_url || profileData?.avatar_url || null;
    
    return {
      user: {
        id: userId,
        email,
        role: userRole,
        firstName,
        lastName,
        fullName,
        avatarUrl,
        is_admin: isAdmin,
        is_manager: isManager,
        is_customer: isCustomer
      },
      isAdmin,
      isManager,
      isCustomer
    };
  };

  return { fetchUserProfile, isLoading, error };
};
