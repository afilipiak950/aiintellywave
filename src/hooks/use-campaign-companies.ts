
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCampaignCompanies = (campaignId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [assignedCompanyIds, setAssignedCompanyIds] = useState<string[]>([]);
  
  // Fetch available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        // Get all companies from the database
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Error fetching companies:', error);
          return;
        }
        
        setCompanies(data || []);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);

  // Fetch assigned companies for the specific campaign
  useEffect(() => {
    if (!campaignId) return;

    const fetchAssignedCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('campaign_company_assignments')
          .select('company_id')
          .eq('campaign_id', campaignId);

        if (error) {
          console.error('Error fetching campaign company assignments:', error);
          return;
        }

        setAssignedCompanyIds((data || []).map(item => item.company_id));
      } catch (error) {
        console.error('Failed to fetch campaign company assignments:', error);
      }
    };

    fetchAssignedCompanies();
  }, [campaignId]);
  
  const updateCampaignCompanies = async (companyIds: string[]): Promise<boolean> => {
    if (!campaignId) {
      console.error('Cannot update company assignments: No campaign ID provided');
      toast({
        title: 'Error',
        description: 'Cannot update assignments: Campaign ID is missing',
        variant: 'destructive'
      });
      return false;
    }
    
    setIsUpdating(true);
    try {
      console.log('Updating company assignments for campaign:', campaignId, companyIds);
      
      // Get the session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!sessionData?.session) {
        throw new Error('You need to be logged in to update campaign company assignments');
      }
      
      // First, delete all existing assignments for this campaign
      const { error: deleteError } = await supabase
        .from('campaign_company_assignments')
        .delete()
        .eq('campaign_id', campaignId);
      
      if (deleteError) {
        throw new Error(`Error deleting existing assignments: ${deleteError.message}`);
      }
      
      // Then insert new assignments
      if (companyIds.length > 0) {
        const assignmentsToInsert = companyIds.map(companyId => ({
          campaign_id: campaignId,
          company_id: companyId,
          created_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('campaign_company_assignments')
          .insert(assignmentsToInsert);
        
        if (insertError) {
          throw new Error(`Error creating assignments: ${insertError.message}`);
        }
      }
      
      toast({
        title: 'Assignments Updated',
        description: 'Campaign company assignments have been updated successfully.'
      });
      
      setAssignedCompanyIds(companyIds);
      return true;
    } catch (error: any) {
      console.error('Error updating campaign company assignments:', error);
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
  
  return {
    updateCampaignCompanies,
    isUpdating,
    companies,
    isLoadingCompanies,
    assignedCompanyIds
  };
};
