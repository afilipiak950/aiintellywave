
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';

export const useAdminRepair = (refreshFn: () => Promise<void>) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairingCompanyUsers, setIsRepairingCompanyUsers] = useState(false);
  const { user } = useAuth();
  
  /**
   * Repair admin user role
   */
  const handleUserRoleRepair = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to repair admin access",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsRepairing(true);
      
      // Add admin role in user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        }, { onConflict: 'user_id,role' });
        
      if (roleError) {
        throw roleError;
      }
      
      // Ensure user has a company association
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
        
      if (!companyData || companyData.length === 0) {
        // Create a company if none exists
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({ name: 'Admin Company', description: 'Default company for admin' })
          .select()
          .single();
          
        if (companyError) {
          throw companyError;
        }
        
        // Add user association with company
        const { error: associationError } = await supabase
          .from('company_users')
          .insert({
            user_id: user.id,
            company_id: newCompany.id,
            role: 'admin',
            is_admin: true,
            email: user.email
          });
          
        if (associationError) {
          throw associationError;
        }
      } else {
        // Associate user with existing company
        const { error: associationError } = await supabase
          .from('company_users')
          .insert({
            user_id: user.id,
            company_id: companyData[0].id,
            role: 'admin',
            is_admin: true,
            email: user.email
          });
          
        if (associationError) {
          throw associationError;
        }
      }
      
      toast({
        title: "Success",
        description: "Admin access has been repaired"
      });
      
      // Refresh data
      await refreshFn();
      
    } catch (error: any) {
      console.error('Error repairing admin access:', error);
      
      toast({
        title: "Error",
        description: `Failed to repair admin access: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  /**
   * Repair company users
   */
  const handleCompanyUsersRepair = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to repair company users",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsRepairingCompanyUsers(true);
      
      // First run the migration to ensure one company per user
      const { data: migrationResult, error: migrationError } = await supabase.rpc(
        'ensure_single_company_per_user'
      );
      
      if (migrationError) {
        throw migrationError;
      }
      
      toast({
        title: "Success",
        description: "Company users repaired successfully"
      });
      
      // Refresh data
      await refreshFn();
      
    } catch (error: any) {
      console.error('Error repairing company users:', error);
      
      toast({
        title: "Error",
        description: `Failed to repair company users: ${error.message}`,
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
    handleCompanyUsersRepair
  };
};
