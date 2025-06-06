
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCampaignCompanies } from '@/hooks/use-campaign-companies';
import { Campaign } from '@/types/campaign';
import CampaignCompaniesTab from './CampaignCompaniesTab';
import CampaignTagsTab from './CampaignTagsTab';
import { Loader2 } from 'lucide-react';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

const CampaignDetailModal = ({
  isOpen,
  onClose,
  campaign
}: CampaignDetailModalProps) => {
  // Set "companies" as the default tab
  const [activeTab, setActiveTab] = useState('companies');
  
  const { 
    companies,
    isLoadingCompanies,
    assignedCompanyIds,
    updateCampaignCompanies,
    isUpdating
  } = useCampaignCompanies(campaign?.id);
  
  // Reset tab selection when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab('companies');
    }
  }, [isOpen]);

  // Prevent modal from closing when clicking inside tabs or content
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    // Stop event from propagating to the Dialog component
    e.stopPropagation();
  }, []);

  // If no campaign is selected, don't render the modal content
  if (!campaign) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log("CampaignDetailModal: Dialog onOpenChange", open);
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto"
        onClick={handleContentClick}
        onMouseDown={handleContentClick}
        onPointerDown={handleContentClick}
      >
        <DialogHeader>
          <DialogTitle>{campaign.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
          onClick={handleContentClick}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="companies" 
            onClick={handleContentClick}
            onMouseDown={handleContentClick}
          >
            {isLoadingCompanies ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <CampaignCompaniesTab
                companies={companies}
                isLoading={isLoadingCompanies}
                assignedCompanyIds={assignedCompanyIds}
                updateCampaignCompanies={updateCampaignCompanies}
                isUpdating={isUpdating}
              />
            )}
          </TabsContent>
          
          <TabsContent 
            value="tags"
            onClick={handleContentClick}
            onMouseDown={handleContentClick}
          >
            <CampaignTagsTab campaignId={campaign.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal;
