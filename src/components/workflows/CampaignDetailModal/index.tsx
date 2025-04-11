
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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CampaignDetailModalProps {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignDetailModal({ campaign, isOpen, onClose }: CampaignDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  // Ensure tags is always initialized as an array
  const initialTags = Array.isArray(campaign?.tags) ? campaign.tags : [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  
  const { updateCampaignTags, isUpdating, availableTags = [], isLoadingTags } = useCampaignTags(campaign?.id);
  
  const handleSaveTags = async () => {
    if (!selectedTags) return;
    const success = await updateCampaignTags(selectedTags);
    // Success is handled in the hook with toast notifications
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
        <DialogHeader className="flex flex-col md:flex-row justify-between items-start mb-4">
          <div>
            <DialogTitle className="text-xl font-semibold">{campaign?.name || 'Campaign Details'}</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Campaign ID: {campaign?.id || 'Unknown'}
            </DialogDescription>
          </div>
          {campaign?.status === 2 || campaign?.status === 3 ? (
            <Badge 
              variant="default"
              className={cn(
                "mt-2 md:mt-0",
                "bg-amber-100 text-amber-800 hover:bg-amber-200 border-0"
              )}
            >
              Paused
            </Badge>
          ) : null}
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Info className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="sequences" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Sequences
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTabContent 
              campaign={campaign} 
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="audience">
            <AudienceTabContent campaign={campaign} />
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
