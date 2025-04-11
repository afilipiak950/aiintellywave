
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Tag, Users } from 'lucide-react';
import { useCampaignDetail } from './useCampaignDetail';
import { OverviewTabContent } from './OverviewTabContent';
import { SettingsTabContent } from './SettingsTabContent';
import { AudienceTabContent } from './AudienceTabContent';

interface CampaignDetailModalProps {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignDetailModal({ campaign, isOpen, onClose }: CampaignDetailModalProps) {
  const { 
    activeTab, 
    setActiveTab,
    selectedTags,
    setSelectedTags,
    handleSaveTags,
    isUpdating,
    availableTags,
    isLoadingTags,
    formatDate
  } = useCampaignDetail(campaign);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{campaign?.name || 'Campaign Details'}</DialogTitle>
          <DialogDescription>
            Campaign ID: {campaign?.id || 'Unknown'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">
              <Info className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Tag className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="audience">
              <Users className="w-4 h-4 mr-2" />
              Audience
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTabContent 
              campaign={campaign} 
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTabContent 
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              availableTags={availableTags}
              isLoadingTags={isLoadingTags}
              isUpdating={isUpdating}
              handleSaveTags={handleSaveTags}
            />
          </TabsContent>
          
          <TabsContent value="audience">
            <AudienceTabContent campaign={campaign} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
