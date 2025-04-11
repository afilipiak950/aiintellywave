
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multiselect';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchAuthUsers } from '@/services/userService';
import { useAuthUsers } from '@/hooks/use-auth-users';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface UserAssignmentTabProps {
  campaignId?: string;
  isLoading?: boolean;
}

const UserAssignmentTab = ({
  campaignId,
  isLoading = false
}: UserAssignmentTabProps) => {
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUserChanges, setHasUserChanges] = useState(false);
  
  // Use the useAuthUsers hook to fetch all users
  const { users, loading: isLoadingUsers } = useAuthUsers();

  // Fetch assigned users
  useEffect(() => {
    if (!campaignId) return;

    const fetchAssignedUsers = async () => {
      try {
        console.log('Fetching assigned users for campaign:', campaignId);
        
        // Check if the campaign_user_assignments table exists
        const { data: existsData, error: existsError } = await supabase.rpc(
          'get_table_exists',
          { table_name: 'campaign_user_assignments' }
        );
        
        if (existsError) {
          console.error('Error checking if table exists:', existsError);
          return;
        }
        
        if (!existsData) {
          console.log('campaign_user_assignments table does not exist yet');
          return;
        }
        
        const { data, error } = await supabase
          .from('campaign_user_assignments')
          .select('user_id')
          .eq('campaign_id', campaignId);

        if (error) {
          if (error.code === '42P01') {
            console.log('Table campaign_user_assignments does not exist yet');
          } else {
            throw error;
          }
        } else {
          const userIds = data.map(item => item.user_id);
          console.log('Assigned user IDs:', userIds);
          setAssignedUserIds(userIds);
        }
      } catch (error) {
        console.error('Error fetching assigned users:', error);
      }
    };

    fetchAssignedUsers();
  }, [campaignId]);

  // Handle user selection change
  const handleUserSelectionChange = (selected: string[]) => {
    setAssignedUserIds(selected);
    setHasUserChanges(true);
  };

  // Save user assignments
  const updateCampaignUsers = async () => {
    if (!campaignId) return false;
    
    setIsUpdating(true);
    try {
      console.log('Updating user assignments for campaign:', campaignId);
      console.log('User IDs to assign:', assignedUserIds);
      
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('campaign_user_assignments')
        .delete()
        .eq('campaign_id', campaignId);
      
      if (deleteError) {
        throw new Error(`Error deleting existing user assignments: ${deleteError.message}`);
      }
      
      if (assignedUserIds.length > 0) {
        // Create new assignments
        const assignmentsToInsert = assignedUserIds.map(userId => ({
          campaign_id: campaignId,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('campaign_user_assignments')
          .insert(assignmentsToInsert);
          
        if (insertError) {
          throw new Error(`Error creating new user assignments: ${insertError.message}`);
        }
      }
      
      setHasUserChanges(false);
      toast({
        title: 'Success',
        description: 'User assignments updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating user assignments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user assignments',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Create user options for MultiSelect
  const userOptions = users.map(user => ({
    value: user.id || user.user_id,
    label: user.full_name || user.email
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
        <p className="text-sm text-gray-500 mb-4">
          Assign users who will have direct access to this campaign
        </p>
        <MultiSelect
          options={userOptions}
          selected={assignedUserIds}
          onChange={handleUserSelectionChange}
          placeholder="Select users..."
          emptyMessage="No users available"
          isLoading={isLoadingUsers}
          disabled={isUpdating}
        />
      </div>
          
      {hasUserChanges && (
        <Button 
          onClick={updateCampaignUsers} 
          disabled={isUpdating || !hasUserChanges} 
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
              Save User Assignments
            </>
          )}
        </Button>
      )}
          
      {users.length === 0 && !isLoadingUsers && (
        <div className="text-center py-8 text-muted-foreground">
          No users available to assign to this campaign.
        </div>
      )}
    </div>
  );
};

export default UserAssignmentTab;
