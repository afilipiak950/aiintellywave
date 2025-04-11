
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Define types for our hook
type Company = {
  id: string;
  name: string;
};

export const useCampaignCompanies = (campaignId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch all available companies for selection
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies-for-selection'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data as Company[];
      } catch (error: any) {
        console.error('Error fetching companies:', error);
        return [];
      }
    }
  });
  
  // Fetch assigned companies for a specific campaign
  const { data: assignedCompanies, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['campaign-company-assignments', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      
      try {
        // Use direct RPC call to get assigned companies
        const { data, error } = await supabase.rpc('get_campaign_company_assignments', {
          campaign_id_param: campaignId
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data as { company_id: string }[];
      } catch (error: any) {
        console.error('Error fetching assigned companies:', error);
        return [];
      }
    },
    enabled: !!campaignId
  });
  
  // Transform assigned companies to array of IDs for easier handling
  const assignedCompanyIds = assignedCompanies?.map(assignment => assignment.company_id) || [];
  
  // Update campaign company assignments
  const updateCampaignCompanies = async (companyIds: string[]): Promise<boolean> => {
    if (!campaignId) return false;
    
    setIsUpdating(true);
    try {
      // Get the session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!sessionData?.session) {
        throw new Error('You need to be logged in to update campaign company assignments');
      }
      
      const accessToken = sessionData.session.access_token;
      
      // Call the edge function to update campaign company assignments
      const response = await supabase.functions.invoke('instantly-ai', {
        body: { 
          action: 'updateCampaignCompanyAssignments',
          campaignId,
          companyIds
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update campaign company assignments');
      }
      
      toast({
        title: 'Companies Updated',
        description: 'Campaign company assignments have been updated successfully.'
      });
      
      // Refresh the assignments
      await refetchAssignments();
      
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
    companies: companies || [],
    isLoadingCompanies,
    assignedCompanyIds,
    isLoadingAssignments
  };
};
