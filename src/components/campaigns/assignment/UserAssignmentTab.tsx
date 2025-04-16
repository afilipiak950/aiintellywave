
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, Search, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { fetchUserData } from '@/services/user/userDataService';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch all available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('UserAssignmentTab: Fetching all users data');
        const userData = await fetchUserData();
        
        console.log(`UserAssignmentTab: Received ${userData.length} users from fetchUserData`);
        
        if (userData && userData.length > 0) {
          // Log details of first few users for debugging
          userData.slice(0, 3).forEach(user => {
            console.log(`User sample - ID: ${user.user_id}, Email: ${user.email}, Name: ${user.full_name}`);
          });
          
          const formattedUsers = userData.map(user => ({
            id: user.user_id,
            name: user.full_name || user.email || 'Unknown User',
            email: user.email || 'No email',
            role: user.role || 'customer'
          }));
          
          console.log(`UserAssignmentTab: Formatted ${formattedUsers.length} users`);
          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
        } else {
          console.warn('UserAssignmentTab: No users data received');
          setError("No users found. Please check your connection and try again.");
          toast({
            title: "Warning",
            description: "No users found in the system.",
            variant: "default"
          });
        }
      } catch (error: any) {
        console.error('UserAssignmentTab: Error fetching users:', error);
        setError(`Error loading users: ${error.message || 'Unknown error'}`);
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
      } catch (error: any) {
        console.error('Error fetching assigned users:', error);
        toast({
          title: "Error",
          description: `Failed to fetch assigned users: ${error.message}`,
          variant: "destructive"
        });
      }
    };
    
    if (campaignId) {
      fetchAssignedUsers();
    }
  }, [campaignId]);
  
  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) || 
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.role.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  const handleUserToggle = (userId: string) => {
    setAssignedUserIds(prevIds => {
      if (prevIds.includes(userId)) {
        return prevIds.filter(id => id !== userId);
      } else {
        return [...prevIds, userId];
      }
    });
    setHasChanges(true);
  };
  
  const handleSave = async () => {
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
    } catch (error: any) {
      console.error('Error updating user assignments:', error);
      toast({
        title: "Error",
        description: `Failed to update users: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchUserData()
      .then(userData => {
        console.log(`Retry: Received ${userData.length} users`);
        
        const formattedUsers = userData.map(user => ({
          id: user.user_id,
          name: user.full_name || user.email || 'Unknown User',
          email: user.email || 'No email',
          role: user.role || 'customer'
        }));
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      })
      .catch(error => {
        console.error('Retry error:', error);
        setError(`Error loading users: ${error.message || 'Unknown error'}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-red-500 font-medium">{error}</div>
        <Button onClick={handleRetry} variant="outline">
          <Loader2 className="mr-2 h-4 w-4" />
          Retry Loading Users
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Assigned Users</label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Assign users to this campaign. Assigned users will receive notifications when leads are generated.
        </p>
        <div className="text-sm text-blue-600">
          Available users: {users.length} • Filtered: {filteredUsers.length} • Assigned: {assignedUserIds.length}
        </div>
      </div>
      
      <div className="border rounded-md">
        <ScrollArea className="h-[300px] rounded-md">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No users found matching your search.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-2 rounded-md ${
                    assignedUserIds.includes(user.id) ? 'bg-primary/10' : 'hover:bg-accent'
                  }`}
                >
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={assignedUserIds.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`user-${user.id}`}
                      className="flex flex-col text-sm cursor-pointer"
                    >
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </label>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-slate-100">
                    {user.role}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {assignedUserIds.length} {assignedUserIds.length === 1 ? 'user' : 'users'} assigned
        </div>
        
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={isUpdating} 
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
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users available to assign to this campaign.
        </div>
      )}
    </div>
  );
};

export default UserAssignmentTab;
