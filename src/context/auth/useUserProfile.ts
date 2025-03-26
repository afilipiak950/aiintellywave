
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
      
      // First, try to get user role directly using our secure function
      const { data: roleData, error: roleError } = await supabase.rpc(
        'get_user_role',
        { user_id: userId }
      );
      
      if (roleError) {
        console.warn('Error fetching role with RPC function:', roleError);
        // Don't throw, we'll try the direct query as fallback
      } else {
        console.log('Role data from RPC function:', roleData);
      }
      
      // If RPC fails or returns null, try direct query as fallback
      let userRole = roleData;
      let companyId: string | undefined;
      
      if (!userRole) {
        // Direct query to company_users as fallback
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select('role, company_id, is_admin')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (companyUserError) {
          console.error('Error fetching company user data:', companyUserError);
          // We'll attempt to continue with user profile without role
        } else if (companyUserData) {
          console.log('Company user data from direct query:', companyUserData);
          userRole = companyUserData.role;
          companyId = companyUserData.company_id;
        } else {
          console.warn('No company_users record found via direct query');
        }
      }
      
      // Get user profile for additional info with a direct query
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, is_active')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        // Continue with partial data rather than throwing
      } else {
        console.log('Profile data:', profileData);
      }
      
      // Fetch email from auth.users
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        // Continue with partial data rather than throwing
      }
      
      // Log the email to help troubleshoot the admin issue
      console.log('User email:', user?.email);
      
      // Special case for admin@intellywave.de - ensure they get admin role
      if (user?.email === 'admin@intellywave.de') {
        console.log('Admin email detected, enforcing admin role');
        userRole = 'admin';
      }
      
      // Determine roles based on the role we got
      const isAdmin = userRole === 'admin';
      const isManager = userRole === 'manager';
      const isCustomer = userRole === 'customer';
      
      console.log('Final role determination:', { userRole, isAdmin, isManager, isCustomer });
      
      if (userRole) {
        console.log('User role determined:', userRole);
        
        const userProfile: UserProfile = {
          id: userId,
          email: user?.email,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          companyId: companyId,
          avatar: profileData?.avatar_url,
          role: userRole
        };
        
        console.log('Setting user profile:', userProfile);
        return { 
          user: userProfile, 
          isAdmin, 
          isManager, 
          isCustomer 
        };
      } else {
        // If no role found but we have a user, set a default role
        console.warn('No role found for user, setting as customer by default');
        
        // Special case for admin@intellywave.de - ensure they get admin role
        if (user?.email === 'admin@intellywave.de') {
          console.log('Admin email detected in fallback, enforcing admin role');
          const userProfile: UserProfile = {
            id: userId,
            email: user?.email,
            firstName: profileData?.first_name,
            lastName: profileData?.last_name,
            avatar: profileData?.avatar_url,
            role: 'admin'
          };
          
          return { 
            user: userProfile, 
            isAdmin: true, 
            isManager: false, 
            isCustomer: false 
          };
        }
        
        const userProfile: UserProfile = {
          id: userId,
          email: user?.email,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          avatar: profileData?.avatar_url,
          role: 'customer' // Default role when none is found
        };
        
        // If this was the first attempt, try one more time after a short delay
        if (retryCount < 1) {
          console.log('Will retry fetching role once more after delay');
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchUserProfile(userId), 2000);
          return { 
            user: userProfile, 
            isAdmin: false, 
            isManager: false, 
            isCustomer: true 
          };
        }
        
        return { 
          user: userProfile, 
          isAdmin: false, 
          isManager: false, 
          isCustomer: true 
        };
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Set default role on error
      toast({
        title: "Fehler beim Laden des Benutzerprofils",
        description: "Standardrolle (Kunde) wurde zugewiesen.",
        variant: "destructive"
      });
      
      return {
        user: { 
          id: userId,
          role: 'customer'
        },
        isAdmin: false,
        isManager: false,
        isCustomer: true
      };
    }
  };

  return { fetchUserProfile };
};
