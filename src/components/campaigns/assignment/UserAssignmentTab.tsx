
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multiselect';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCustomers } from '@/hooks/use-customers';

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
  
  // Use the customers hook to fetch real customer data
  const { customers, loading: isLoadingCustomers } = useCustomers();
  
  // Fetch assigned users
  useEffect(() => {
    if (!campaignId) return;

    const fetchAssignedUsers = async () => {
      try {
        console.log('Fetching assigned users for campaign:', campaignId);
        
        // Use the get_campaign_user_assignments function instead of direct table query
        const { data, error } = await supabase
          .rpc('get_campaign_user_assignments', { 
            campaign_id_param: campaignId 
          });
        
        if (error) {
          console.error('Error fetching assigned users:', error);
        } else {
          const userIds = data.map(item => item.user_id);
          console.log('Assigned user IDs:', userIds);
          setAssignedUserIds(userIds);
        }
      } catch (error) {
        console.error('Error in fetchAssignedUsers:', error);
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
      
      // Use custom RPC functions or direct SQL for these operations
      // First, delete existing assignments using the proxy's from method
      const { error: deleteError } = await supabase
        .from('campaign_user_assignments')
        .delete()
        .eq('campaign_id', campaignId);
      
      if (deleteError) {
        throw new Error(`Error deleting existing user assignments: ${deleteError.message}`);
      }
      
      if (assignedUserIds.length > 0) {
        // Create new assignments using the proxy's from method
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

  // Create user options for MultiSelect from customers data
  const userOptions = customers.map(customer => ({
    value: customer.id || customer.user_id || '',
    label: customer.full_name || customer.email || 'Unnamed Customer'
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
          isLoading={isLoadingCustomers}
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
          
      {customers.length === 0 && !isLoadingCustomers && (
        <div className="text-center py-8 text-muted-foreground">
          No users available to assign to this campaign.
        </div>
      )}
    </div>
  );
};

export default UserAssignmentTab;
