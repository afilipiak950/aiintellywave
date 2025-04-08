
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { repairCompanyUsers } from './utils/company-users-debug';
import { repairAdminData } from './services/admin-service';
import { useAuth } from '@/context/auth';

export const useAdminRepair = (onRepairCompleted: () => void) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairingCompanyUsers, setIsRepairingCompanyUsers] = useState(false);
  const { user } = useAuth();
  
  const handleUserRoleRepair = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to repair user roles",
        variant: "destructive"
      });
      return;
    }
    
    setIsRepairing(true);
    
    try {
      const repaired = await repairAdminData(user.id, user.email, {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        checks: []
      });
      
      if (repaired) {
        toast({
          title: "Success",
          description: "Admin data successfully repaired."
        });
        
        // Refresh the customer data
        if (onRepairCompleted) {
          onRepairCompleted();
        }
      } else {
        toast({
          title: "Warning",
          description: "No changes were needed during repair.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error repairing admin data:', error);
      toast({
        title: "Error",
        description: `Failed to repair admin data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  const handleCompanyUsersRepair = async () => {
    setIsRepairingCompanyUsers(true);
    
    try {
      const result = await repairCompanyUsers();
      
      if (result.status === 'success') {
        toast({
          title: "Success",
          description: result.message || `Repaired ${result.repaired} company user associations.`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to repair company users",
          variant: "destructive"
        });
      }
      
      // Refresh the customer data
      if (onRepairCompleted) {
        onRepairCompleted();
      }
    } catch (error: any) {
      console.error('Error in handleCompanyUsersRepair:', error);
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
