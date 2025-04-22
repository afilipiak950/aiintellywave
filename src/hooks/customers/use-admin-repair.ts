
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useAdminRepair(onSuccess: () => void) {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairingCompanyUsers, setIsRepairingCompanyUsers] = useState(false);

  // Repair user roles (add admin role if missing)
  const handleUserRoleRepair = async () => {
    try {
      setIsRepairing(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Check if user already has admin role
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (roleCheckError) {
        console.error('Error checking admin role:', roleCheckError);
        throw new Error('Failed to check admin role');
      }
      
      // If admin role doesn't exist for this user, add it
      if (!existingRole) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });
          
        if (insertError) {
          console.error('Error adding admin role:', insertError);
          throw new Error('Failed to add admin role');
        }
        
        toast({
          title: 'Admin Role Added',
          description: 'You now have admin privileges. Refreshing data...',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Admin Role Verification',
          description: 'Your admin role is already set up correctly.',
          variant: 'default'
        });
      }
      
      // Refresh data after repair
      onSuccess();
    } catch (error: any) {
      console.error('Error in handleUserRoleRepair:', error);
      toast({
        title: 'Repair Failed',
        description: error.message || 'Failed to repair admin role',
        variant: 'destructive'
      });
    } finally {
      setIsRepairing(false);
    }
  };

  // Repair company user associations
  const handleCompanyUsersRepair = async () => {
    try {
      setIsRepairingCompanyUsers(true);
      
      // Call the database function to repair company associations
      const { data, error } = await supabase.rpc('repair_user_company_associations');
      
      if (error) {
        console.error('Error repairing company associations:', error);
        throw error;
      }
      
      const updatedCount = data?.length || 0;
      
      toast({
        title: 'Company Associations Repaired',
        description: `Updated ${updatedCount} user-company associations. Refreshing data...`,
        variant: 'default'
      });
      
      // Refresh data after repair
      onSuccess();
    } catch (error: any) {
      console.error('Error in handleCompanyUsersRepair:', error);
      toast({
        title: 'Repair Failed',
        description: error.message || 'Failed to repair company associations',
        variant: 'destructive'
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
