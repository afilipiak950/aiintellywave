
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/hooks/use-toast';
import { 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  Settings, 
  Activity, 
  BarChart, 
  Tag,
  Plus
} from "lucide-react";
import { useCampaignTags } from '@/hooks/use-campaign-tags';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const { 
    updateCampaignTags, 
    isUpdating, 
    availableTags,
    isLoadingTags
  } = useCampaignTags(campaign?.id);
  
  // Load existing campaign tags when campaign changes
  useEffect(() => {
    if (campaign && Array.isArray(campaign.tags)) {
      setSelectedTags(campaign.tags);
    } else {
      setSelectedTags([]);
    }
  }, [campaign]);
  
  const handleSaveTags = async () => {
    const success = await updateCampaignTags(selectedTags);
    if (success) {
      // Update local state to reflect the change
      campaign.tags = selectedTags;
    }
  };
  
  const handleAddTag = (tag: string) => {
    if (!tag) return;
    
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setNewTag('');
  };
  
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  // Format status
  const formatStatus = (status: any): string => {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Draft';
        case 1: return 'Scheduled';
        case 2: return 'Paused';
        case 3: return 'Paused';
        case 4: return 'Completed';
        case 5: return 'Stopped';
        default: return 'Unknown';
      }
    }
    return typeof status === 'string' 
      ? status.charAt(0).toUpperCase() + status.slice(1) 
      : 'Unknown';
  };
  
  if (!campaign) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">{campaign.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <Badge 
              className={
                (campaign.status === 'active' || campaign.status === 1) 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : (campaign.status === 'paused' || campaign.status === 2 || campaign.status === 3)
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }
            >
              {formatStatus(campaign.status)}
            </Badge>
            <span className="text-gray-500">ID: {campaign.id}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-3 mb-4 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-500">Campaign Info</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>Emails sent: {campaign.statistics?.emailsSent || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Replies: {campaign.statistics?.replies || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>Daily limit: {campaign.dailyLimit || campaign.daily_limit || 50}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-gray-500">Timing</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Created: {new Date(campaign.created_at || campaign.date || campaign.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Last updated: {new Date(campaign.updated_at || campaign.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-500">Results</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>Open rate: {campaign.statistics?.openRate || 0}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>Opens: {campaign.statistics?.opens || 0}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(campaign.statistics?.openRate || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-gray-500">Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTags.length > 0 ? (
                      selectedTags.map((tag, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ✕
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-sm">No tags assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3">Campaign Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-500 text-sm">Emails Sent</p>
                  <p className="text-2xl font-bold">{campaign.statistics?.emailsSent || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-500 text-sm">Open Rate</p>
                  <p className="text-2xl font-bold">{campaign.statistics?.openRate || 0}%</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-500 text-sm">Reply Rate</p>
                  <p className="text-2xl font-bold">
                    {campaign.statistics?.emailsSent ? 
                      (((campaign.statistics?.replies || 0) / campaign.statistics.emailsSent) * 100).toFixed(1) : 
                      0}%
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3">Tags</h3>
              <p className="text-sm text-gray-500 mb-3">
                Assign tags to make this campaign visible to specific customer companies
              </p>
              
              <div className="flex gap-2 mb-4">
                <Select 
                  value={newTag || ""}
                  onValueChange={(value) => handleAddTag(value)}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {isLoadingTags ? (
                        <SelectItem value="" disabled>Loading tags...</SelectItem>
                      ) : availableTags.length > 0 ? (
                        availableTags.map(tag => (
                          <SelectItem 
                            key={tag} 
                            value={tag}
                            disabled={selectedTags.includes(tag)}
                          >
                            {tag}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No tags available</SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => newTag && handleAddTag(newTag)}
                  disabled={!newTag || selectedTags.includes(newTag)}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ✕
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">No tags assigned</span>
                )}
              </div>
              
              <Button 
                type="button"
                onClick={handleSaveTags}
                disabled={isUpdating}
                className="mt-2"
              >
                {isUpdating ? 'Saving...' : 'Save Tags'}
              </Button>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Note: Campaigns with tags will only be visible to customer companies with matching tags.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
