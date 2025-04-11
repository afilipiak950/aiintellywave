
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info, Tag, Users } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { useCampaignTags } from '@/hooks/use-campaign-tags';
import { Skeleton } from '@/components/ui/skeleton';

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
    return new Date(dateString).toLocaleDateString();
  };
  
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
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <Badge variant={campaign?.status === 1 ? "success" : "secondary"}>
                  {campaign?.status === 1 ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  {formatDate(campaign?.created_at)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Campaign Tags</h3>
              <div className="flex flex-wrap gap-1">
                {campaign?.tags?.length > 0 ? (
                  campaign.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tags assigned</p>
                )}
              </div>
            </div>
            
            {campaign?.statistics && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium">Emails Sent</div>
                    <div className="text-2xl font-bold">{campaign.statistics.emailsSent || 0}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium">Open Rate</div>
                    <div className="text-2xl font-bold">{campaign.statistics.openRate || 0}%</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Campaign Tags</h3>
                <p className="text-sm text-muted-foreground mb-4">
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
                      options={availableTags.map(tag => ({ label: tag, value: tag }))}
                      selected={selectedTags}
                      onChange={setSelectedTags}
                      placeholder="Select a tag"
                      className="w-full"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
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
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium mb-2">Email List</h3>
              {campaign?.email_list?.length > 0 ? (
                <div className="space-y-2">
                  {campaign.email_list.map((email: string, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-card rounded-md">
                      <span>{email}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No email list available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
