
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
}

export const useCampaignCompaniesTab = (
  campaignId?: string, 
  propCompanies?: Company[],
  propAssignedCompanyIds?: string[],
  propIsLoading?: boolean,
  propUpdateCampaignCompanies?: (companyIds: string[]) => Promise<boolean>
) => {
  const [companies, setCompanies] = useState<Company[]>(propCompanies || []);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(propAssignedCompanyIds || []);
  const [isLoading, setIsLoading] = useState<boolean>(propIsLoading || true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchCompanies = useCallback(async () => {
    if (propCompanies) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive'
      });
    }
  }, [propCompanies]);
  
  const fetchAssignedCompanies = useCallback(async () => {
    if (propAssignedCompanyIds || !campaignId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching assigned companies for campaign:', campaignId);
      
      const { data, error } = await supabase
        .from('campaign_company_assignments')
        .select('company_id')
        .eq('campaign_id', campaignId);
      
      if (error) {
        throw error;
      }
      
      console.log('Assigned companies data:', data);
      
      if (data && Array.isArray(data)) {
        const companyIds = data.map(item => item.company_id);
        console.log('Setting selected company IDs:', companyIds);
        setSelectedCompanyIds(companyIds);
      }
    } catch (error) {
      console.error('Error fetching assigned companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company assignments',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, propAssignedCompanyIds]);
  
  const saveCompanyAssignments = async () => {
    if (propUpdateCampaignCompanies) {
      return await propUpdateCampaignCompanies(selectedCompanyIds);
    }
    
    try {
      setIsSaving(true);
      console.log('Saving company assignments:', selectedCompanyIds);
      
      const { error: deleteError } = await supabase
        .from('campaign_company_assignments')
        .delete()
        .eq('campaign_id', campaignId);
        
      if (deleteError) {
        throw deleteError;
      }
      
      if (selectedCompanyIds.length > 0) {
        const assignmentsToInsert = selectedCompanyIds.map(companyId => ({
          campaign_id: campaignId,
          company_id: companyId
        }));
        
        const { error: insertError } = await supabase
          .from('campaign_company_assignments')
          .insert(assignmentsToInsert);
          
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: 'Success',
        description: 'Company assignments saved successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving company assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to save company assignments',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCompanies();
      await fetchAssignedCompanies();
    };
    
    loadData();
  }, [fetchCompanies, fetchAssignedCompanies]);

  const handleCompanySelectionChange = (newSelected: string[]) => {
    console.log('Company selection changed:', newSelected);
    setSelectedCompanyIds(newSelected);
  };

  return {
    companies,
    selectedCompanyIds,
    isLoading,
    isSaving,
    companyOptions: companies.map(company => ({
      value: company.id,
      label: company.name
    })),
    handleCompanySelectionChange,
    saveCompanyAssignments
  };
};
