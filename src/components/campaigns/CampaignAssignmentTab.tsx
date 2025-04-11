
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multiselect';
import { Loader2, Save, UserPlus, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUsers } from '@/hooks/use-auth-users';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Company {
  id: string;
  name: string;
}

interface CampaignAssignmentTabProps {
  campaignId?: string;
  isLoading?: boolean;
}

const CampaignAssignmentTab = ({
  campaignId,
  isLoading = false
}: CampaignAssignmentTabProps) => {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignedCompanyIds, setAssignedCompanyIds] = useState<string[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasCompanyChanges, setHasCompanyChanges] = useState(false);
  const [hasUserChanges, setHasUserChanges] = useState(false);
  
  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch all users from the company_users table
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const { data, error } = await supabase
          .from('company_users')
          .select('user_id:id, email, full_name')
          .order('full_name');

        if (error) throw error;
        
        // Ensure we don't have duplicate users by user_id
        const uniqueUsers = data?.reduce((acc: User[], user) => {
          if (!acc.some(u => u.id === user.id)) {
            acc.push(user);
          }
          return acc;
        }, []) || [];
        
        setUsers(uniqueUsers);
        console.log('Fetched users:', uniqueUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch assigned companies
  useEffect(() => {
    if (!campaignId) return;

    const fetchAssignedCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('campaign_company_assignments')
          .select('company_id')
          .eq('campaign_id', campaignId);

        if (error) throw error;
        
        const companyIds = data.map(item => item.company_id);
        setAssignedCompanyIds(companyIds);
      } catch (error) {
        console.error('Error fetching assigned companies:', error);
      }
    };

    fetchAssignedCompanies();
  }, [campaignId]);

  // Fetch assigned users
  useEffect(() => {
    if (!campaignId) return;

    const fetchAssignedUsers = async () => {
      try {
        console.log('Fetching assigned users for campaign:', campaignId);
        const { data, error } = await supabase
          .from('campaign_user_assignments')
          .select('user_id')
          .eq('campaign_id', campaignId);

        if (error) throw error;
        
        const userIds = data.map(item => item.user_id);
        console.log('Assigned user IDs:', userIds);
        setAssignedUserIds(userIds);
      } catch (error) {
        console.error('Error fetching assigned users:', error);
      }
    };

    fetchAssignedUsers();
  }, [campaignId]);

  // Handle company selection change
  const handleCompanySelectionChange = (selected: string[]) => {
    setAssignedCompanyIds(selected);
    setHasCompanyChanges(true);
  };

  // Handle user selection change
  const handleUserSelectionChange = (selected: string[]) => {
    setAssignedUserIds(selected);
    setHasUserChanges(true);
  };

  // Save company assignments
  const updateCampaignCompanies = async () => {
    if (!campaignId) return false;
    
    setIsUpdating(true);
    try {
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('campaign_company_assignments')
        .delete()
        .eq('campaign_id', campaignId);
      
      if (deleteError) {
        throw new Error(`Error deleting existing assignments: ${deleteError.message}`);
      }
      
      if (assignedCompanyIds.length > 0) {
        // Create new assignments
        const assignmentsToInsert = assignedCompanyIds.map(companyId => ({
          campaign_id: campaignId,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('campaign_company_assignments')
          .insert(assignmentsToInsert);
          
        if (insertError) {
          throw new Error(`Error creating new assignments: ${insertError.message}`);
        }
      }
      
      setHasCompanyChanges(false);
      toast({
        title: 'Success',
        description: 'Company assignments updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating company assignments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company assignments',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
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

  // Prepare select options
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));
  
  const userOptions = users.map(user => ({
    value: user.id,
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
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned Companies</label>
            <p className="text-sm text-gray-500 mb-4">
              Assign companies to make this campaign visible to specific customer companies
            </p>
            <MultiSelect
              options={companyOptions}
              selected={assignedCompanyIds}
              onChange={handleCompanySelectionChange}
              placeholder="Select companies..."
              emptyMessage="No companies available"
              isLoading={isLoadingCompanies}
              disabled={isUpdating}
            />
          </div>
          
          {hasCompanyChanges && (
            <Button 
              onClick={updateCampaignCompanies} 
              disabled={isUpdating || !hasCompanyChanges} 
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
                  Save Company Assignments
                </>
              )}
            </Button>
          )}
          
          {companies.length === 0 && !isLoadingCompanies && (
            <div className="text-center py-8 text-muted-foreground">
              No companies available to assign to this campaign.
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="pt-4 space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignAssignmentTab;
