
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaign } from '@/hooks/use-campaign';
import CampaignDetailHeader from '@/components/campaigns/CampaignDetailHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import CampaignAssignmentTab from '@/components/campaigns/CampaignAssignmentTab';
import CampaignTagsTab from '@/components/campaigns/CampaignTagsTab';

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { campaign, isLoading: isCampaignLoading } = useCampaign(id);
  
  // Set "assignments" as the default tab
  const [activeTab, setActiveTab] = useState('assignments');
  
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
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assignments">
          <CampaignAssignmentTab campaignId={id} />
        </TabsContent>
        
        <TabsContent value="tags">
          <CampaignTagsTab campaignId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetail;
