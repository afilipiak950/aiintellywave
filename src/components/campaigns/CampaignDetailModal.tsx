
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCampaignCompanies } from '@/hooks/use-campaign-companies';
import { Campaign } from '@/types/campaign';
import { CampaignCompaniesTab } from './CampaignCompaniesTab';
import CampaignTagsTab from './CampaignTagsTab';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <DialogHeader className="text-center relative">
          <DialogTitle>{campaign.name}</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Campaign ID: {campaign.id}
          </p>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
          onClick={handleContentClick}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="overview" 
            onClick={handleContentClick}
            onMouseDown={handleContentClick}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Campaign Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd>{campaign.status || '2'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd>{campaign.description || 'No description available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                    <dd>
                      {campaign.start_date
                        ? new Date(campaign.start_date).toLocaleDateString()
                        : 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                    <dd>
                      {campaign.end_date
                        ? new Date(campaign.end_date).toLocaleDateString()
                        : 'Not set'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.tags && campaign.tags.length > 0 ? (
                    campaign.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No tags assigned</span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent 
            value="statistics"
            onClick={handleContentClick}
            onMouseDown={handleContentClick}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-muted/40 rounded-lg">
                <dt className="text-sm font-medium text-muted-foreground">Emails Sent</dt>
                <dd className="text-2xl font-bold mt-1">
                  {campaign.statistics?.emailsSent || campaign.statistics?.emails_sent || 0}
                </dd>
              </div>

              <div className="p-4 bg-muted/40 rounded-lg">
                <dt className="text-sm font-medium text-muted-foreground">Opens</dt>
                <dd className="text-2xl font-bold mt-1">
                  {campaign.statistics?.opens || 0}
                </dd>
              </div>

              <div className="p-4 bg-muted/40 rounded-lg">
                <dt className="text-sm font-medium text-muted-foreground">Replies</dt>
                <dd className="text-2xl font-bold mt-1">
                  {campaign.statistics?.replies || 0}
                </dd>
              </div>
            </div>
          </TabsContent>
          
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal;
