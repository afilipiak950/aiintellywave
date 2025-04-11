
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Info, Tag, Users } from "lucide-react";
import { useCampaignDetail } from '@/hooks/use-campaign-detail';
import { OverviewTabContent } from './campaign-detail/OverviewTabContent';
import { SettingsTabContent } from './campaign-detail/SettingsTabContent';
import { AudienceTabContent } from './campaign-detail/AudienceTabContent';

export const CampaignDetailModal: React.FC<{
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({
  campaign,
  isOpen,
  onClose
}) => {
  const {
    activeTab,
    setActiveTab,
    selectedTags,
    setSelectedTags,
    isUpdating,
    availableTags,
    isLoadingTags,
    handleSaveTags
  } = useCampaignDetail(campaign);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{campaign?.name || 'Campaign Details'}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
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
            <OverviewTabContent campaign={campaign} />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTabContent 
              campaign={campaign}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              isLoadingTags={isLoadingTags}
              availableTags={availableTags}
              isUpdating={isUpdating}
              handleSaveTags={handleSaveTags}
            />
          </TabsContent>
          
          <TabsContent value="audience">
            <AudienceTabContent campaign={campaign} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
