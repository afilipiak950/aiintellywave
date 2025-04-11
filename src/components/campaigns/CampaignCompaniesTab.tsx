
import React, { useState, useEffect, useCallback } from 'react';
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
  campaignId: string;
}

export const CampaignCompaniesTab: React.FC<CampaignCompaniesTabProps> = ({ campaignId }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load all companies
  const fetchCompanies = useCallback(async () => {
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
  }, []);
  
  // Fetch assigned companies for this campaign
  const fetchAssignedCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching assigned companies for campaign:', campaignId);
      
      const { data, error } = await supabase.rpc(
        'get_campaign_company_assignments',
        { campaign_id_param: campaignId }
      );
      
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
  }, [campaignId]);
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchCompanies();
      await fetchAssignedCompanies();
    };
    
    loadData();
  }, [fetchCompanies, fetchAssignedCompanies]);
  
  // Handle save of company assignments
  const handleSaveAssignments = async () => {
    try {
      setIsSaving(true);
      console.log('Saving company assignments:', selectedCompanyIds);
      
      // Call the RPC function to assign companies
      const { data, error } = await supabase.rpc(
        'assign_companies_to_campaign',
        { 
          campaign_id_param: campaignId,
          company_ids: selectedCompanyIds
        }
      );
      
      if (error) {
        throw error;
      }
      
      console.log('Save response:', data);
      
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
                disabled={isSaving}
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
