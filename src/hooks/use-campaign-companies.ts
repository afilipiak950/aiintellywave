
import { useState, useEffect } from 'react';
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
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  
  // Fetch all available companies for selection
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies-for-selection'],
    queryFn: async () => {
      try {
        console.log("Fetching all companies for selection");
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
        
        if (error) {
          throw new Error(error.message);
        }
        
        console.log("Fetched companies:", data?.length || 0);
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
        console.log("Fetching company assignments for campaign:", campaignId);
        // Directly query the campaign_company_assignments table
        const { data, error } = await supabase
          .from('campaign_company_assignments')
          .select('company_id')
          .eq('campaign_id', campaignId);
        
        if (error) {
          console.error('Error fetching campaign company assignments:', error);
          throw new Error(error.message);
        }
        
        console.log('Assigned companies for campaign', campaignId, ':', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error('Error fetching assigned companies:', error);
        return [];
      }
    },
    enabled: !!campaignId
  });
  
  // Update local state when assigned companies data changes
  useEffect(() => {
    if (assignedCompanies) {
      const companyIds = assignedCompanies.map(assignment => assignment.company_id);
      setSelectedCompanyIds(companyIds);
      console.log('Updated selected company IDs:', companyIds);
    }
  }, [assignedCompanies]);
  
  // Update campaign company assignments with improved error handling and logging
  const updateCampaignCompanies = async (companyIds: string[]): Promise<boolean> => {
    if (!campaignId) return false;
    
    setIsUpdating(true);
    try {
      console.log('Updating company assignments for campaign', campaignId);
      console.log('New company IDs:', companyIds);
      
      // First update the local state
      setSelectedCompanyIds(companyIds);
      
      // Delete existing assignments
      console.log('Deleting existing assignments');
      const { error: deleteError } = await supabase
        .from('campaign_company_assignments')
        .delete()
        .eq('campaign_id', campaignId);
      
      if (deleteError) {
        throw new Error(`Error deleting existing assignments: ${deleteError.message}`);
      }
      
      // Skip insert if no companyIds
      if (companyIds.length === 0) {
        console.log('No companies to assign, skipping insert');
        await refetchAssignments();
        return true;
      }
      
      // Create new assignments
      const assignmentsToInsert = companyIds.map(companyId => ({
        campaign_id: campaignId,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      console.log('Inserting new assignments:', assignmentsToInsert.length);
      
      const { error: insertError } = await supabase
        .from('campaign_company_assignments')
        .insert(assignmentsToInsert);
        
      if (insertError) {
        throw new Error(`Error creating new assignments: ${insertError.message}`);
      }
      
      console.log('Successfully updated campaign company assignments');
      
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
    assignedCompanyIds: selectedCompanyIds,
    isLoadingAssignments,
    setSelectedCompanyIds
  };
};
