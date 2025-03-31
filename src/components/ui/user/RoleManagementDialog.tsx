
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AuthUser } from '@/services/types/customerTypes';

// Define allowed role types as plain strings
type UserRole = 'admin' | 'manager' | 'customer';

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
  const [selectedRole, setSelectedRole] = useState<UserRole>((userData?.user_metadata?.role as UserRole) || 'customer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = async () => {
    if (!userId) return;
    
    try {
      setIsSubmitting(true);
      
      // Instead of using RPC, perform a direct update to company_users table
      const { data, error } = await supabase
        .from('company_users')
        .update({ role: selectedRole })
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Also update user_roles table for redundancy
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: selectedRole  // Now using a string type
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
      
      if (roleError) {
        console.error('Error updating user_roles:', roleError);
        // Continue anyway since the main update succeeded
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
              onValueChange={(value: UserRole) => setSelectedRole(value)}
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
