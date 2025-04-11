
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multiselect';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { fetchUserData } from '@/services/user/userDataService';

interface UserAssignmentTabProps {
  campaignId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UserAssignmentTab = ({ campaignId }: UserAssignmentTabProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useAuth();
  
  // Fetch all available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Use userDataService to fetch users properly
        const userData = await fetchUserData();
        
        if (userData) {
          // Map the user data to the format we need
          setUsers(userData.map(user => ({
            id: user.user_id || user.id,
            name: user.full_name || user.email,
            email: user.email,
            role: user.role
          })));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Fetch assigned users for the campaign
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (!campaignId) return;
      
      try {
        console.log("Fetching assigned users for campaign:", campaignId);
        const { data, error } = await supabase
          .from('campaign_user_assignments')
          .select('user_id')
          .eq('campaign_id', campaignId);
          
        if (error) throw error;
        
        const userIds = data?.map(item => item.user_id) || [];
        console.log("Assigned user IDs:", userIds);
        setAssignedUserIds(userIds);
        setHasChanges(false);
      } catch (error) {
        console.error('Error fetching assigned users:', error);
      }
    };
    
    if (campaignId) {
      fetchAssignedUsers();
    }
  }, [campaignId]);
  
  const handleSelectionChange = (selected: string[]) => {
    console.log("UserAssignmentTab: Selection changed to:", selected);
    setAssignedUserIds(selected);
    setHasChanges(true);
  };
  
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!campaignId) return;
    
    setIsUpdating(true);
    try {
      console.log("UserAssignmentTab: Saving user assignments:", assignedUserIds);
      
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('campaign_user_assignments')
        .delete()
        .eq('campaign_id', campaignId);
        
      if (deleteError) throw deleteError;
      
      // Skip insert if no user IDs
      if (assignedUserIds.length === 0) {
        toast({
          title: "Users updated",
          description: "No users assigned to this campaign."
        });
        setHasChanges(false);
        return;
      }
      
      // Insert new assignments
      const assignmentsToInsert = assignedUserIds.map(userId => ({
        campaign_id: campaignId,
        user_id: userId
      }));
      
      const { error: insertError } = await supabase
        .from('campaign_user_assignments')
        .insert(assignmentsToInsert);
        
      if (insertError) throw insertError;
      
      toast({
        title: "Users updated",
        description: "The campaign users have been updated successfully."
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating user assignments:', error);
      toast({
        title: "Error",
        description: "Failed to update users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const userOptions = users.map(user => ({
    value: user.id,
    label: user.name || user.email
  }));
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Assigned Users</label>
        <MultiSelect
          options={userOptions}
          selected={assignedUserIds}
          onChange={handleSelectionChange}
          placeholder="Select users..."
          emptyMessage="No users available"
          disabled={isUpdating}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Assign users to this campaign. Assigned users will receive notifications when leads are generated.
        </p>
      </div>
      
      {hasChanges && (
        <Button 
          onClick={handleSave} 
          disabled={isUpdating || !hasChanges} 
          className="w-full sm:w-auto"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      )}
      
      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users available to assign to this campaign.
        </div>
      )}
    </div>
  );
};

export default UserAssignmentTab;
