
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MultiSelect } from '@/components/ui/multiselect';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface CampaignCompaniesTabProps {
  campaignId?: string;
  companies?: Company[];
  isLoading?: boolean;
  assignedCompanyIds?: string[];
  updateCampaignCompanies?: (companyIds: string[]) => Promise<boolean>;
  isUpdating?: boolean;
}

export const CampaignCompaniesTab: React.FC<CampaignCompaniesTabProps> = ({ 
  campaignId,
  companies: propCompanies,
  isLoading: propIsLoading,
  assignedCompanyIds: propAssignedCompanyIds,
  updateCampaignCompanies: propUpdateCampaignCompanies,
  isUpdating: propIsUpdating
}) => {
  const [companies, setCompanies] = useState<Company[]>(propCompanies || []);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(propAssignedCompanyIds || []);
  const [isLoading, setIsLoading] = useState(propIsLoading || true);
  const [isSaving, setIsSaving] = useState(propIsUpdating || false);
  
  // Load all companies if not provided through props
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
  
  // Fetch assigned companies for this campaign if not provided through props
  const fetchAssignedCompanies = useCallback(async () => {
    if (propAssignedCompanyIds || !campaignId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching assigned companies for campaign:', campaignId);
      
      // Using from() to query the table directly instead of using rpc()
      const { data, error } = await supabase
        .from('campaign_company_assignments')
        .select('company_id')
        .eq('campaign_id', campaignId);
      
      if (error) {
        throw error;
      }
      
      console.log('Assigned companies data:', data);
      
      if (data && Array.isArray(data)) {
        // Extract company IDs from the response
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
  
  // Load data when component mounts
  React.useEffect(() => {
    const loadData = async () => {
      await fetchCompanies();
      await fetchAssignedCompanies();
    };
    
    loadData();
  }, [fetchCompanies, fetchAssignedCompanies]);
  
  // Handle save of company assignments
  const handleSaveAssignments = async () => {
    // If the parent component provided an update function, use it
    if (propUpdateCampaignCompanies) {
      await propUpdateCampaignCompanies(selectedCompanyIds);
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('Saving company assignments:', selectedCompanyIds);
      
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('campaign_company_assignments')
        .delete()
        .eq('campaign_id', campaignId);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // If there are companies to assign, insert new records
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
    } catch (error) {
      console.error('Error saving company assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to save company assignments',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle company selection change
  const handleCompanySelectionChange = (newSelected: string[]) => {
    console.log('Company selection changed:', newSelected);
    setSelectedCompanyIds(newSelected);
  };
  
  // Map companies to options format for MultiSelect
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));
  
  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Assign Companies to Campaign</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select the companies that should be assigned to this campaign.
              </p>
              
              <MultiSelect
                options={companyOptions}
                selected={selectedCompanyIds}
                onChange={handleCompanySelectionChange}
                placeholder="Select companies..."
                emptyMessage="No companies available"
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveAssignments}
                disabled={isSaving || isLoading}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Assignments
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
