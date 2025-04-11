
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
  X,
  Info,
  Users,
  MessageSquare,
  MailOpen
} from "lucide-react";
import { useCampaignTags } from '@/hooks/use-campaign-tags';
import { MultiSelect } from '@/components/ui/multi-select';
import { Skeleton } from '@/components/ui/skeleton';

export const CampaignDetailModal: React.FC<{
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({
  campaign,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
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
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

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
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge 
                  variant="outline"
                  className="bg-amber-50 text-amber-800 border-amber-200 font-normal"
                >
                  {campaign?.status === 1 ? 'Active' : 'Paused'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {formatDate(campaign?.created_at)}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Campaign Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-500 mb-1 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Emails Sent
                  </div>
                  <div className="text-xl font-semibold">{campaign?.emailsSent || campaign?.statistics?.emailsSent || 0}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-500 mb-1 flex items-center">
                    <MailOpen className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Opens
                  </div>
                  <div className="text-xl font-semibold">{campaign?.opens || 0}</div>
                  <div className="text-xs text-gray-500">{campaign?.openRate || campaign?.statistics?.openRate || 0}% rate</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-500 mb-1 flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Replies
                  </div>
                  <div className="text-xl font-semibold">{campaign?.replies || 0}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-500 mb-1 flex items-center">
                    <Activity className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Bounce Rate
                  </div>
                  <div className="text-xl font-semibold">{campaign?.bounceRate || '0'}%</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Campaign Tags</h3>
              <div className="flex flex-wrap gap-1">
                {campaign?.tags?.length > 0 ? (
                  campaign.tags.map((tag: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No tags assigned</p>
                )}
              </div>
            </div>
            
            {campaign?.dailyLimit && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Daily Sending Limit</h3>
                <p className="text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {campaign.dailyLimit} emails per day
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Campaign Tags</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Assign tags to make this campaign visible to specific customer companies.
                </p>
                
                {isLoadingTags ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <>
                    <MultiSelect
                      options={availableTags.map(tag => ({
                        label: tag,
                        value: tag
                      }))}
                      selected={selectedTags}
                      onChange={setSelectedTags}
                      placeholder="Select a tag"
                      className="w-full"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Selected tags: {selectedTags.length}
                    </div>
                  </>
                )}
                
                <Button 
                  onClick={handleSaveTags}
                  disabled={isUpdating}
                  className="mt-4"
                >
                  {isUpdating ? 'Saving...' : 'Save Tags'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audience" className="space-y-4">
            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="font-medium mb-2">Email List</h3>
              {campaign?.email_list?.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {campaign.email_list.map((email: string, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-white rounded-md border">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{email}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No email list available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
