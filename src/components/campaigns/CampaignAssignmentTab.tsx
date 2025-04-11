
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, UserPlus, Building } from 'lucide-react';
import CompanyAssignmentTab from './assignment/CompanyAssignmentTab';
import UserAssignmentTab from './assignment/UserAssignmentTab';

interface CampaignAssignmentTabProps {
  campaignId?: string;
  isLoading?: boolean;
}

const CampaignAssignmentTab = ({
  campaignId,
  isLoading = false
}: CampaignAssignmentTabProps) => {
  const [activeTab, setActiveTab] = useState('companies');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="pt-4">
          <CompanyAssignmentTab campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="users" className="pt-4">
          <UserAssignmentTab campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignAssignmentTab;
