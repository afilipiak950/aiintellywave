
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { repairCompanyUsers } from './utils/company-users-debug';

export function useAdminRepair(refreshFn: () => void) {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairingCompanyUsers, setIsRepairingCompanyUsers] = useState(false);
  
  /**
   * Handle user role repair
   */
  const handleUserRoleRepair = async () => {
    try {
      setIsRepairing(true);
      
      // This would call a function to repair user roles
      const { error } = await supabase.functions.invoke('repair-user-roles', {
        method: 'POST',
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "User roles repaired successfully"
      });
      
      // Refresh data
      refreshFn();
    } catch (error: any) {
      console.error('Error repairing user roles:', error);
      toast({
        title: "Error",
        description: `Failed to repair user roles: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  /**
   * Handle company users repair
   */
  const handleCompanyUsersRepair = async () => {
    try {
      setIsRepairingCompanyUsers(true);
      
      console.log('Starting company users repair...');
      const repairResult = await repairCompanyUsers();
      
      if (repairResult.status === 'error') {
        throw new Error(repairResult.error);
      }
      
      console.log('Repair completed:', repairResult);
      
      toast({
        title: "Success",
        description: "Company associations repaired successfully"
      });
      
      // After repair is successful, refresh data
      refreshFn();
    } catch (error: any) {
      console.error('Error repairing company users:', error);
      toast({
        title: "Error",
        description: `Failed to repair company associations: ${error.message}`,
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
}
