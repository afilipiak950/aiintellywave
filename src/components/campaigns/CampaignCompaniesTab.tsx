
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CompanySelector } from './CompanySelector';
import { SaveAssignmentsButton } from './SaveAssignmentsButton';
import { useCampaignCompaniesTab, Company } from '@/hooks/use-campaign-companies-tab';

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
  const {
    companyOptions,
    selectedCompanyIds,
    isLoading,
    isSaving,
    handleCompanySelectionChange,
    saveCompanyAssignments
  } = useCampaignCompaniesTab(
    campaignId,
    propCompanies,
    propAssignedCompanyIds,
    propIsLoading,
    propUpdateCampaignCompanies
  );
  
  const handleSave = async () => {
    await saveCompanyAssignments();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <CompanySelector
              options={companyOptions}
              selectedIds={selectedCompanyIds}
              onChange={handleCompanySelectionChange}
              disabled={isSaving}
            />
            
            <SaveAssignmentsButton
              onClick={handleSave}
              isSaving={isSaving}
              isDisabled={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
