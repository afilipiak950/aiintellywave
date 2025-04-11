
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
import { 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  Settings, 
  Activity,
  BarChart, 
  Tag,
  X
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
import { FormattedDate } from '../ui/formatted-date';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 bg-background border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-semibold">{campaign.name}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Campaign ID: {campaign.id}
              </DialogDescription>
            </div>
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
          </div>
        </DialogHeader>
        
        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
        >
          <TabsList className="w-full rounded-none border-b justify-start px-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sequences" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Sequences
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Settings
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Advanced
            </TabsTrigger>
            <TabsTrigger value="tags" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Tags
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-4 space-y-6 focus:outline-none">
            <div className="grid grid-cols-2 gap-6">
              {/* Campaign Statistics */}
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Campaign Statistics</h3>
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Emails Sent</div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-xl">{campaign.statistics?.emailsSent || 0}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Replies</div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-xl">{campaign.statistics?.replies || 0}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Opens</div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-xl">{campaign.statistics?.opens || 0}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Bounces</div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-xl">{campaign.statistics?.bounces || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-1">Open Rate</div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{campaign.statistics?.openRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(campaign.statistics?.openRate || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Campaign Details */}
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Campaign Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {new Date(campaign.created_at || campaign.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Updated:</span>
                    <span className="font-medium">
                      {new Date(campaign.updated_at || campaign.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Daily limit:</span>
                    <span className="font-medium">
                      {campaign.dailyLimit || campaign.daily_limit || 50}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Stop on reply:</span>
                    <span className="font-medium">
                      {campaign.stop_on_reply ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Stop on auto-reply:</span>
                    <span className="font-medium">
                      {campaign.stop_on_auto_reply ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email Recipients */}
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Email Recipients</h3>
              <div className="space-y-2">
                {campaign.recipients && campaign.recipients.length > 0 ? (
                  campaign.recipients.map((recipient: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{recipient}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No recipients information available</div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Sequences Tab */}
          <TabsContent value="sequences" className="p-4 space-y-4 focus:outline-none">
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium mb-4">Sequence 1</h3>
              <div className="space-y-8">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Email {index + 1}</span>
                          <span className="text-sm text-gray-500">Wait 2 days</span>
                        </div>
                        <div className="mb-2">
                          <div className="text-sm text-gray-500 mb-1">Subject:</div>
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            {index === 2 ? 'Ein kurzer Reminder' : '[use_ai_agent]'}
                          </div>
                        </div>
                        {index === 2 && (
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Body:</div>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              Hallo {{first_name}}, ich hoffe, Sie haben unsere vorherigen E-Mails erhalten. Unsere Lösungen haben vielen Unternehmen geholfen, ihre Online-Präsenz zu verbessern. Wenn einige Sekunden Zeit haben, können wir uns nächste Woche zusammensetzen?
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="p-4 space-y-6 focus:outline-none">
            {/* Schedule Settings */}
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Schedule Settings</h3>
              <div className="mb-4">
                <div className="mb-2 font-medium">New schedule</div>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-gray-500 mr-1">Time:</span>
                    <span>09:00 - 16:00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 mr-1">Timezone:</span>
                    <span>America/Detroit</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 mr-1">Days:</span>
                    <span>Mon, Tue, Wed, Thu, Fri</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Sending Settings */}
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Sending Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Daily limit:</span>
                    <span className="font-medium">
                      {campaign.dailyLimit || campaign.daily_limit || 90}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tracking links:</span>
                    <span className="font-medium">Disabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tracking opens:</span>
                    <span className="font-medium">Disabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Text only:</span>
                    <span className="font-medium">No</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Match lead ESP:</span>
                    <span className="font-medium">No</span>
                  </div>
                </div>
              </div>
              
              {/* Stop Conditions */}
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Stop Conditions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-green-500">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>Stop on reply</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-red-500">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span>Stop on auto-reply</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-500">Auto variant select:</span>
                    <span className="font-medium">Not configured</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced" className="p-4 space-y-6 focus:outline-none">
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Advanced Settings</h3>
              <div className="text-muted-foreground">
                No advanced settings are configured for this campaign.
              </div>
            </div>
          </TabsContent>
          
          {/* Tags Tab (kept separate as requested) */}
          <TabsContent value="tags" className="p-4 space-y-6 focus:outline-none">
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Campaign Tags</h3>
              <p className="text-sm text-gray-500 mb-4">
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
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} <X className="ml-1 h-3 w-3" />
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
        
        <DialogFooter className="p-4 border-t bg-gray-50">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
