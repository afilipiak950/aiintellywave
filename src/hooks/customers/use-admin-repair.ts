
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { diagnoseCompanyUsers, repairCompanyUsers } from './utils/company-users-debug';

export const useAdminRepair = (fetchCustomers: () => Promise<void>) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairingCompanyUsers, setIsRepairingCompanyUsers] = useState(false);
  
  const handleUserRoleRepair = async () => {
    try {
      setIsRepairing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "No authenticated user found",
          variant: "destructive"
        });
        return;
      }
      
      // Force add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: user.id, role: 'admin' }, 
          { onConflict: 'user_id,role' });
          
      if (roleError) {
        console.error('Failed to add admin role:', roleError);
        toast({
          title: "Error",
          description: "Failed to repair admin role. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Create a default company for admin if needed
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .maybeSingle();
        
      if (!existingCompany) {
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            name: 'Admin Company',
            description: 'Default company for admin users',
            contact_email: user.email
          });
          
        if (companyError && !companyError.message.includes('violates foreign key constraint')) {
          console.error('Failed to create company:', companyError);
          toast({
            title: "Warning",
            description: "Created admin role but couldn't create company. Refresh to try again.",
            variant: "default"
          });
        }
      }
      
      // Add admin to company_users with first company
      const companyId = existingCompany?.id || '00000000-0000-0000-0000-000000000000';
      const { error: companyUserError } = await supabase
        .from('company_users')
        .upsert({ 
          user_id: user.id, 
          company_id: companyId,
          is_admin: true,
          role: 'admin',
          email: user.email
        }, { onConflict: 'user_id,company_id' });
        
      if (companyUserError && !companyUserError.message.includes('violates foreign key constraint')) {
        console.error('Failed to add admin to company_users:', companyUserError);
      }
      
      toast({
        title: "Success",
        description: "Admin role repaired. Refreshing data...",
        variant: "default"
      });
      
      // Refresh all data
      await fetchCustomers();
      
      // If still having issues, reload the page
      const { data: customerCheck } = await supabase
        .from('company_users')
        .select('count')
        .eq('role', 'customer')
        .single();
        
      if (!customerCheck || customerCheck.count === 0) {
        toast({
          title: "Reloading page",
          description: "Still having issues. Reloading page in 1 second...",
          variant: "default"
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error repairing admin role:', error);
      toast({
        title: "Error",
        description: "Failed to repair admin role: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleCompanyUsersRepair = async () => {
    try {
      setIsRepairingCompanyUsers(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "No authenticated user found",
          variant: "destructive"
        });
        return;
      }
      
      // Create debug info object
      const localDebugInfo = {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
      };
      
      // Run the repair
      const updatedDebug = await repairCompanyUsers(
        user.id, 
        user.email, 
        localDebugInfo
      );
      
      console.log("Company users repair result:", updatedDebug.companyUsersRepair);
      
      if (updatedDebug.companyUsersRepair?.status === 'success') {
        toast({
          title: "Success",
          description: "Company user association repaired. Refreshing data...",
          variant: "default"
        });
      } else if (updatedDebug.companyUsersRepair?.status === 'exists') {
        toast({
          title: "Information",
          description: "Company user association already exists.",
          variant: "default"
        });
      } else {
        toast({
          title: "Warning",
          description: "Repair attempt completed with status: " + updatedDebug.companyUsersRepair?.status,
          variant: "default"
        });
      }
      
      // Refresh customers data
      await fetchCustomers();
      
    } catch (error: any) {
      console.error("Error repairing company users:", error);
      toast({
        title: "Error",
        description: "Failed to repair company users: " + (error.message || "Unknown error"),
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
