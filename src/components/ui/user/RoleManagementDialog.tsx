
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AuthUser } from '@/services/types/customerTypes';

interface RoleManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onRoleUpdated: () => void;
  userData?: AuthUser | null;
}

const RoleManagementDialog = ({ 
  isOpen, 
  onClose, 
  userId, 
  onRoleUpdated,
  userData
}: RoleManagementDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<string>(userData?.user_metadata?.role || 'customer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = async () => {
    if (!userId) return;
    
    try {
      setIsSubmitting(true);
      
      // Call the RPC function to update the user's role
      const { data, error } = await supabase.rpc('update_user_role', {
        _user_id: userId,
        _new_role: selectedRole
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Role updated",
        description: `User role successfully changed to ${selectedRole}`,
      });
      
      onRoleUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update user role',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage User Role</DialogTitle>
          <DialogDescription>
            Change the role of this user. This will affect their permissions and access level.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 text-sm">
            <h4 className="font-medium">Role permissions:</h4>
            {selectedRole === 'admin' && (
              <p className="text-muted-foreground">
                Full access to all features, users, and settings.
              </p>
            )}
            {selectedRole === 'manager' && (
              <p className="text-muted-foreground">
                Can manage projects, customers, and basic settings.
              </p>
            )}
            {selectedRole === 'customer' && (
              <p className="text-muted-foreground">
                Limited access to view and participate in assigned projects.
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleRoleChange} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleManagementDialog;
