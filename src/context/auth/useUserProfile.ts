
import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../hooks/use-toast';
import { UserProfile } from './types';

export const useUserProfile = () => {
  const [retryCount, setRetryCount] = useState(0);

  const fetchUserProfile = async (userId: string): Promise<{
    user: UserProfile | null;
    isAdmin: boolean;
    isManager: boolean;
    isCustomer: boolean;
  }> => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // Special case for admin@intellywave.de - detect first using auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser?.email === 'admin@intellywave.de') {
        console.log('Admin email detected in fetchUserProfile, enforcing admin role');
        const userProfile: UserProfile = {
          id: userId,
          email: authUser.email,
          role: 'admin',
          is_admin: true,
          is_manager: false,
          is_customer: false
        };
        
        return { 
          user: userProfile, 
          isAdmin: true, 
          isManager: false, 
          isCustomer: false 
        };
      }
      
      // First, try to get user role from company_users table directly to avoid ambiguity
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select('role, company_id, is_admin, email, full_name, first_name, last_name, avatar_url')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (companyUserError) {
        console.error('Error fetching company user data:', companyUserError);
        // Continue with other methods to determine role
      } else if (companyUserData) {
        console.log('Company user data from direct query:', companyUserData);
        const userRole = companyUserData.role;
        
        // Get user profile for additional info with a direct query
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, is_active')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
        } else {
          console.log('Profile data:', profileData);
        }
        
        // Determine roles based on the role we got
        const isAdmin = userRole === 'admin';
        const isManager = userRole === 'manager';
        const isCustomer = userRole === 'customer';
        
        console.log('Role determined from company_users:', { userRole, isAdmin, isManager, isCustomer });
        
        const userProfile: UserProfile = {
          id: userId,
          email: companyUserData.email || authUser?.email,
          firstName: companyUserData.first_name || profileData?.first_name,
          lastName: companyUserData.last_name || profileData?.last_name,
          companyId: companyUserData.company_id,
          avatar: companyUserData.avatar_url || profileData?.avatar_url,
          role: userRole,
          is_admin: isAdmin,
          is_manager: isManager,
          is_customer: isCustomer
        };
        
        return { 
          user: userProfile, 
          isAdmin, 
          isManager, 
          isCustomer 
        };
      }
      
      // Fallback: Check user_roles table
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (userRoleError) {
        console.error('Error fetching user role data:', userRoleError);
      } else if (userRoleData) {
        console.log('User role data:', userRoleData);
        const userRole = userRoleData.role;
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, is_active')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
        } else {
          console.log('Profile data:', profileData);
        }
        
        // Determine roles based on the role we got
        const isAdmin = userRole === 'admin';
        const isManager = userRole === 'manager';
        const isCustomer = userRole === 'customer';
        
        console.log('Role determined from user_roles:', { userRole, isAdmin, isManager, isCustomer });
        
        const userProfile: UserProfile = {
          id: userId,
          email: authUser?.email,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          avatar: profileData?.avatar_url,
          role: userRole,
          is_admin: isAdmin,
          is_manager: isManager,
          is_customer: isCustomer
        };
        
        return { 
          user: userProfile, 
          isAdmin, 
          isManager, 
          isCustomer 
        };
      }
      
      // If no role found after checking both tables, set a default role
      console.warn('No role found for user in any table, setting as customer by default');
      
      // Get base profile data anyway
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();
      
      const userProfile: UserProfile = {
        id: userId,
        email: authUser?.email,
        firstName: profileData?.first_name,
        lastName: profileData?.last_name,
        avatar: profileData?.avatar_url,
        role: 'customer', // Default role when none is found
        is_admin: false,
        is_manager: false,
        is_customer: true
      };
      
      // If this was the first attempt, try one more time after a short delay
      if (retryCount < 1) {
        console.log('Will retry fetching role once more after delay');
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchUserProfile(userId), 2000);
      }
      
      return { 
        user: userProfile, 
        isAdmin: false, 
        isManager: false, 
        isCustomer: true 
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      
      toast({
        title: "Error loading user profile",
        description: "Default role (customer) has been assigned.",
        variant: "destructive"
      });
      
      return {
        user: { 
          id: userId,
          role: 'customer',
          is_admin: false,
          is_manager: false,
          is_customer: true
        },
        isAdmin: false,
        isManager: false,
        isCustomer: true
      };
    }
  };

  return { fetchUserProfile };
};
