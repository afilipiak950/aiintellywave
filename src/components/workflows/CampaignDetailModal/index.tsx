
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Info, Tag, Users, Settings } from 'lucide-react';
import { useCampaignTags } from '@/hooks/use-campaign-tags';
import { OverviewTabContent } from './OverviewTabContent';
import { SettingsTabContent } from './SettingsTabContent';
import { SequencesTabContent } from './SequencesTabContent';
import { AudienceTabContent } from './AudienceTabContent';

interface CampaignDetailModalProps {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignDetailModal({ campaign, isOpen, onClose }: CampaignDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTags, setSelectedTags] = useState<string[]>(campaign?.tags || []);
  const { updateCampaignTags, isUpdating, availableTags, isLoadingTags } = useCampaignTags(campaign?.id);
  
  const handleSaveTags = async () => {
    const success = await updateCampaignTags(selectedTags);
    if (success) {
      // Successfully saved
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Format date as in the image (DD.M.YYYY, HH:MM:SS)
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-col md:flex-row justify-between items-start mb-2">
          <div>
            <DialogTitle className="text-xl">{campaign?.name || 'Campaign Details'}</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Campaign ID: {campaign?.id || 'Unknown'}
            </DialogDescription>
          </div>
          {campaign?.status === 2 || campaign?.status === 3 ? (
            <div className="mt-2 md:mt-0 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              Paused
            </div>
          ) : null}
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50">
              <Info className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sequences" className="data-[state=active]:bg-blue-50">
              <Calendar className="w-4 h-4 mr-2" />
              Sequences
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-50">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-50">
              <Tag className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTabContent 
              campaign={campaign} 
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="sequences">
            <SequencesTabContent campaign={campaign} />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTabContent 
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              availableTags={availableTags}
              isLoadingTags={isLoadingTags}
              isUpdating={isUpdating}
              handleSaveTags={handleSaveTags}
              campaign={campaign}
            />
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="text-center p-8 text-muted-foreground">
              Advanced settings are not available in this view.
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
