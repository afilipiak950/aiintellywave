
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaign } from '@/hooks/use-campaign';
import { useCampaignCompanies } from '@/hooks/use-campaign-companies';
import CampaignDetailHeader from '@/components/campaigns/CampaignDetailHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import CampaignCompaniesTab from '@/components/campaigns/CampaignCompaniesTab';
import CampaignTagsTab from '@/components/campaigns/CampaignTagsTab';

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { campaign, isLoading: isCampaignLoading } = useCampaign(id);
  const { 
    companies,
    isLoadingCompanies,
    assignedCompanyIds,
    updateCampaignCompanies
  } = useCampaignCompanies(id);
  
  // Set "companies" as the default tab
  const [activeTab, setActiveTab] = useState('companies');
  
  if (isCampaignLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignDetailHeader campaign={campaign} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="companies">
          <CampaignCompaniesTab 
            companies={companies} 
            isLoading={isLoadingCompanies}
            assignedCompanyIds={assignedCompanyIds}
            updateCampaignCompanies={updateCampaignCompanies}
          />
        </TabsContent>
        
        <TabsContent value="tags">
          <CampaignTagsTab campaignId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetail;
