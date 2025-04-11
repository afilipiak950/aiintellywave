
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multiselect';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  id: string;
  name: string;
}

interface CompanyAssignmentTabProps {
  campaignId?: string;
  isLoading?: boolean;
}

const CompanyAssignmentTab = ({
  campaignId,
  isLoading = false
}: CompanyAssignmentTabProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [assignedCompanyIds, setAssignedCompanyIds] = useState<string[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasCompanyChanges, setHasCompanyChanges] = useState(false);

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
  
  // Handle company selection change
  const handleCompanySelectionChange = (selected: string[]) => {
    setAssignedCompanyIds(selected);
    setHasCompanyChanges(true);
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

  // Prepare select options
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
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
    </div>
  );
};

export default CompanyAssignmentTab;
