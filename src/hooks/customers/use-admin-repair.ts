
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { CustomerDebugInfo } from './types';

export const useAdminRepair = (refreshCallback: () => Promise<void>) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairingCompanyUsers, setIsRepairingCompanyUsers] = useState(false);
  const [debugInfo, setDebugInfo] = useState<CustomerDebugInfo | null>(null);

  /**
   * Function to repair user role assignments by ensuring the admin@intellywave.de
   * account has proper admin access
   */
  const handleUserRoleRepair = async () => {
    try {
      setIsRepairing(true);
      
      // Step 1: Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Step 2: Check if this is the special admin account
      const isSpecialAdmin = user.email === 'admin@intellywave.de';
      
      // Only proceed with repair if this is admin@intellywave.de
      if (!isSpecialAdmin) {
        toast({
          title: "Unauthorized",
          description: "Only the main admin account can perform this action.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Starting admin role repair...');
      
      // Step 3: Ensure admin role exists for this user in user_roles
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (!existingRole) {
        // Insert admin role
        await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });
          
        console.log('Added admin role to user_roles');
      }
      
      // Step 4: Ensure admin flag set in company_users
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (companyUser) {
        if (!companyUser.is_admin) {
          await supabase
            .from('company_users')
            .update({ 
              is_admin: true,
              role: 'admin' 
            })
            .eq('user_id', user.id);
            
          console.log('Updated company_user to admin');
        }
      } else {
        // Get default company or create one
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .limit(1)
          .single();
        
        if (company) {
          // Add user to company as admin
          await supabase
            .from('company_users')
            .insert({
              user_id: user.id,
              company_id: company.id,
              is_admin: true,
              role: 'admin',
              email: user.email
            });
            
          console.log('Created company_user association with admin role');
        } else {
          throw new Error('No companies exist. Please create a company first.');
        }
      }
      
      toast({
        title: "Repair Successful",
        description: "Admin role has been correctly set up."
      });
      
      // Refresh data
      await refreshCallback();
      
    } catch (error: any) {
      console.error('Error in handleUserRoleRepair:', error);
      
      toast({
        title: "Repair Failed",
        description: error.message || "Failed to repair admin role.",
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  /**
   * Function to repair company-user associations by calling the database function
   */
  const handleCompanyUsersRepair = async () => {
    try {
      setIsRepairingCompanyUsers(true);
      
      // Call the RPC function to migrate users with multiple companies to single company
      // Updated to use the correct function name
      const { data, error } = await supabase.rpc('migrate_to_single_company_per_user');
      
      if (error) throw error;
      
      console.log('Company users repair result:', data);
      
      setDebugInfo(prev => ({
        ...prev,
        companyUsersRepair: {
          status: 'success',
          message: `Fixed ${data.length} user associations`
        }
      }));
      
      toast({
        title: "Repair Successful",
        description: `Fixed ${data.length} company-user associations.`
      });
      
      // Refresh data
      await refreshCallback();
      
    } catch (error: any) {
      console.error('Error in handleCompanyUsersRepair:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        companyUsersRepair: {
          status: 'error',
          error: error.message
        }
      }));
      
      toast({
        title: "Repair Failed",
        description: error.message || "Failed to repair company-user associations.",
        variant: "destructive"
      });
    } finally {
      setIsRepairingCompanyUsers(false);
    }
  };
  
  return {
    isRepairing,
    isRepairingCompanyUsers,
    handleUserRoleRepair,
    handleCompanyUsersRepair,
    debugInfo
  };
};
