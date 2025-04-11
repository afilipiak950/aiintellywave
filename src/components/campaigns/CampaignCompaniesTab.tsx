
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multiselect';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
}

interface CampaignCompaniesTabProps {
  companies: Company[];
  isLoading: boolean;
  assignedCompanyIds: string[];
  updateCampaignCompanies: (companyIds: string[]) => Promise<boolean>;
  isUpdating?: boolean;
}

const CampaignCompaniesTab = ({
  companies,
  isLoading,
  assignedCompanyIds,
  updateCampaignCompanies,
  isUpdating = false
}: CampaignCompaniesTabProps) => {
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize selected companies from props
  useEffect(() => {
    setSelectedCompanyIds(assignedCompanyIds || []);
  }, [assignedCompanyIds]);
  
  // Handle selection changes
  const handleSelectionChange = (selected: string[]) => {
    setSelectedCompanyIds(selected);
    setHasChanges(true);
  };
  
  // Save changes
  const handleSave = async () => {
    const success = await updateCampaignCompanies(selectedCompanyIds);
    if (success) {
      setHasChanges(false);
      toast({
        title: "Companies updated",
        description: "The campaign companies have been updated successfully."
      });
    }
  };
  
  // Prepare options for the MultiSelect
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
        <MultiSelect
          options={companyOptions}
          selected={selectedCompanyIds}
          onChange={handleSelectionChange}
          placeholder="Select companies..."
          emptyMessage="No companies available"
          disabled={isUpdating}
        />
      </div>
      
      {hasChanges && (
        <Button 
          onClick={handleSave} 
          disabled={isUpdating || !hasChanges} 
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
      
      {companies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No companies available to assign to this campaign.
        </div>
      )}
    </div>
  );
};

export default CampaignCompaniesTab;
