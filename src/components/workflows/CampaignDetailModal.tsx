
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignCompaniesTab } from '@/components/campaigns/CampaignCompaniesTab';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampaignDetailModalProps {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4 text-center">
          <DialogTitle className="text-xl font-bold">{campaign.name}</DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Campaign ID: {campaign.campaign_id || campaign.id}
          </p>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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

          <TabsContent value="statistics" className="space-y-4">
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

          <TabsContent value="companies">
            <CampaignCompaniesTab campaignId={campaign.campaign_id || campaign.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
