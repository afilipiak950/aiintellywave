
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
  const [modalShouldClose, setModalShouldClose] = useState(false);
  
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
      setModalShouldClose(false);
    }
  }, [isOpen]);

  // If no campaign is selected, don't render the modal content
  if (!campaign) return null;

  // Comprehensive handler to prevent bubbling up events
  const handleContentClick = (e: React.MouseEvent) => {
    // Block all event propagation to prevent closing the modal
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Enhanced handler for dialog state changes
  const handleOpenChange = (open: boolean) => {
    // Only respect explicit close requests (not from inside dropdowns)
    if (!open && modalShouldClose) {
      onClose();
    } else if (!open) {
      // Prevented an unexpected close
      console.log("Prevented unexpected modal close");
      return false;
    }
  };

  // Add capture phase handlers to prevent close events
  const preventClose = (e: any) => {
    e.stopPropagation();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Set flag to allow closing only when user explicitly wants to close
          setModalShouldClose(true);
          onClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto"
        onClick={handleContentClick}
        onMouseDown={preventClose}
        onPointerDown={preventClose}
        onPointerDownOutside={(e) => {
          // Allow closing only on explicit background clicks
          e.preventDefault();
          setModalShouldClose(true);
          onClose();
        }}
      >
        <DialogHeader>
          <DialogTitle>{campaign.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="companies" 
            onClick={(e) => {
              // Critical: Stop event propagation at the tab content level
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={preventClose}
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
            onClick={(e) => {
              // Also stop propagation on the tags tab
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={preventClose}
          >
            <CampaignTagsTab campaignId={campaign.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal;
