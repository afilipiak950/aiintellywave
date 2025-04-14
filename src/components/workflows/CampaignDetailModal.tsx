
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
import { 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  Settings, 
  Activity,
  BarChart, 
  Building,
  X,
  Check,
  ArrowRight,
  Clock4
} from "lucide-react";
import CampaignAssignmentTab from '@/components/campaigns/CampaignAssignmentTab';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedDate } from '../ui/formatted-date';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [detailedCampaign, setDetailedCampaign] = useState<any>(campaign);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { isAdmin, isManager } = useAuth();
  
  // Check if user has permission to see the assignments tab
  const canSeeAssignments = isAdmin || isManager;
  
  // Load detailed campaign data when the modal is opened
  useEffect(() => {
    if (isOpen && campaign?.id) {
      fetchCampaignDetails(campaign.id);
    }
  }, [isOpen, campaign?.id]);
  
  // Fetch detailed campaign information including sequences
  const fetchCampaignDetails = async (campaignId: string) => {
    try {
      setIsLoadingDetails(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.error('No active session found');
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      const response = await supabase.functions.invoke('instantly-ai', {
        body: { 
          action: 'getCampaignDetail',
          campaignId: campaignId
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.error) {
        toast({
          title: 'Error',
          description: 'Failed to load campaign details',
          variant: 'destructive'
        });
        return;
      }
      
      if (response.data && response.data.campaign) {
        setDetailedCampaign(response.data.campaign);
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaign details',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };
  
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
  
  // Tab click handling 
  const handleTabClick = (value: string) => {
    setSelectedTab(value);
  };
  
  // If the selected tab is 'assignments' but the user can't see it,
  // reset to 'overview' tab
  useEffect(() => {
    if (selectedTab === 'assignments' && !canSeeAssignments) {
      setSelectedTab('overview');
    }
  }, [selectedTab, canSeeAssignments]);
  
  // Get email recipients from the campaign
  const getEmailRecipients = () => {
    if (!detailedCampaign) return [];
    
    // Check different possible locations for recipients data
    if (detailedCampaign.email_list && Array.isArray(detailedCampaign.email_list)) {
      return detailedCampaign.email_list;
    }
    
    if (detailedCampaign.recipients && Array.isArray(detailedCampaign.recipients)) {
      return detailedCampaign.recipients;
    }
    
    // Check in raw_data if exists
    if (detailedCampaign.raw_data && detailedCampaign.raw_data.email_list && Array.isArray(detailedCampaign.raw_data.email_list)) {
      return detailedCampaign.raw_data.email_list;
    }
    
    return [];
  };
  
  // Get the campaign sequences
  const getSequences = () => {
    if (!detailedCampaign) return [];
    
    if (detailedCampaign.sequences && Array.isArray(detailedCampaign.sequences)) {
      return detailedCampaign.sequences;
    }
    
    if (detailedCampaign.raw_data && detailedCampaign.raw_data.sequences) {
      return detailedCampaign.raw_data.sequences;
    }
    
    return [];
  };
  
  // Format waiting time (in days or hours)
  const formatWaitTime = (waitValue: number, waitUnit: string) => {
    if (!waitValue) return 'No delay';
    
    if (waitUnit === 'days') {
      return `Wait ${waitValue} day${waitValue > 1 ? 's' : ''}`;
    } else if (waitUnit === 'hours') {
      return `Wait ${waitValue} hour${waitValue > 1 ? 's' : ''}`;
    }
    
    return `Wait ${waitValue} ${waitUnit}`;
  };
  
  if (!detailedCampaign) return null;
  
  const emailRecipients = getEmailRecipients();
  const sequences = getSequences();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 bg-background border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-semibold">{detailedCampaign.name}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Campaign ID: {detailedCampaign.id}
              </DialogDescription>
            </div>
            <Badge 
              className={
                (detailedCampaign.status === 'active' || detailedCampaign.status === 1) 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : (detailedCampaign.status === 'paused' || detailedCampaign.status === 2 || detailedCampaign.status === 3)
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }
            >
              {formatStatus(detailedCampaign.status)}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs 
          value={selectedTab} 
          onValueChange={handleTabClick}
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
            {canSeeAssignments && (
              <TabsTrigger value="assignments" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                Assignments
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="p-4 space-y-6 focus:outline-none">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center h-64">
                <Activity className="h-8 w-8 animate-pulse text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-md border p-4">
                  <h3 className="font-medium text-lg mb-4">Campaign Statistics</h3>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Emails Sent</div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-xl">
                          {detailedCampaign.statistics?.total_sent || 
                           detailedCampaign.statistics?.emails_sent || 
                           detailedCampaign.statistics?.emailsSent || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Replies</div>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-xl">
                          {detailedCampaign.statistics?.total_replied || 
                           detailedCampaign.statistics?.replies || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Opens</div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-xl">
                          {detailedCampaign.statistics?.total_opened || 
                           detailedCampaign.statistics?.opens || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Bounces</div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-xl">
                          {detailedCampaign.statistics?.total_bounced || 
                           detailedCampaign.statistics?.bounces || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-1">Open Rate</div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">
                        {detailedCampaign.statistics?.open_rate || 
                         detailedCampaign.statistics?.openRate || 
                         Math.round((detailedCampaign.statistics?.total_opened || 0) / 
                                    (detailedCampaign.statistics?.total_sent || 1) * 100) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(
                            detailedCampaign.statistics?.open_rate || 
                            detailedCampaign.statistics?.openRate || 
                            Math.round((detailedCampaign.statistics?.total_opened || 0) / 
                                      (detailedCampaign.statistics?.total_sent || 1) * 100) || 0, 
                            100
                          )}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-md border p-4">
                  <h3 className="font-medium text-lg mb-4">Campaign Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">
                        {new Date(detailedCampaign.created_at || detailedCampaign.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Updated:</span>
                      <span className="font-medium">
                        {new Date(detailedCampaign.updated_at || detailedCampaign.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Daily limit:</span>
                      <span className="font-medium">
                        {detailedCampaign.dailyLimit || 
                         detailedCampaign.daily_limit || 
                         detailedCampaign.daily_sending_limit || 50}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Stop on reply:</span>
                      <span className="font-medium">
                        {detailedCampaign.stop_on_reply ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Stop on auto-reply:</span>
                      <span className="font-medium">
                        {detailedCampaign.stop_on_auto_reply ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Email Recipients</h3>
              <div className="space-y-2">
                {emailRecipients && emailRecipients.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    {emailRecipients.slice(0, 10).map((recipient: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{recipient}</span>
                      </div>
                    ))}
                    {emailRecipients.length > 10 && (
                      <div className="text-sm text-gray-500 mt-2 italic">
                        + {emailRecipients.length - 10} more recipients
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No recipients information available</div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sequences" className="p-4 space-y-4 focus:outline-none">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center h-64">
                <Activity className="h-8 w-8 animate-pulse text-primary" />
              </div>
            ) : sequences && sequences.length > 0 ? (
              <div className="bg-white rounded-md border p-4">
                {sequences.map((sequence: any, seqIdx: number) => (
                  <div key={seqIdx} className="mb-8 last:mb-0">
                    <h3 className="font-medium mb-4 text-lg">Sequence {seqIdx + 1}</h3>
                    <div className="space-y-8">
                      {sequence.emails && Array.isArray(sequence.emails) ? (
                        sequence.emails.map((email: any, emailIdx: number) => (
                          <div key={emailIdx} className="border-b pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 text-blue-500 mt-1" />
                              <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium">Email {emailIdx + 1}</span>
                                  <span className="text-sm text-gray-500">
                                    {formatWaitTime(email.wait_value || 0, email.wait_unit || 'days')}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <div className="text-sm text-gray-500 mb-1">Subject:</div>
                                  <div className="text-sm bg-gray-50 p-2 rounded">
                                    {email.subject || '[use_ai_agent]'}
                                  </div>
                                </div>
                                {email.body && (
                                  <div>
                                    <div className="text-sm text-gray-500 mb-1">Body:</div>
                                    <div className="text-sm bg-gray-50 p-2 rounded max-h-48 overflow-y-auto whitespace-pre-wrap">
                                      {email.body}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic">No email sequences found</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Sequence 1</h3>
                <div className="space-y-8">
                  {Array.from({ length: 3 }).map((_, index) => (
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
                                Hallo {'{{'}{'{'}first_name{'}}'}{'}}'}, ich hoffe, Sie haben unsere vorherigen E-Mails erhalten. Unsere Lösungen haben vielen Unternehmen geholfen, ihre Online-Präsenz zu verbessern. Wenn einige Sekunden Zeit haben, können wir uns nächste Woche zusammensetzen?
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="p-4 space-y-6 focus:outline-none">
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Schedule Settings</h3>
              <div className="mb-4">
                <div className="mb-2 font-medium">Schedule</div>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-gray-500 mr-1">Time:</span>
                    <span>
                      {detailedCampaign.schedule?.start_time || '09:00'} - {detailedCampaign.schedule?.end_time || '16:00'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 mr-1">Timezone:</span>
                    <span>
                      {detailedCampaign.schedule?.timezone || 'Europe/Berlin'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 mr-1">Days:</span>
                    <span>
                      {detailedCampaign.schedule?.days?.join(', ') || 'Mon, Tue, Wed, Thu, Fri'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Sending Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Daily limit:</span>
                    <span className="font-medium">
                      {detailedCampaign.daily_sending_limit || 
                       detailedCampaign.dailyLimit || 
                       detailedCampaign.daily_limit || 90}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tracking links:</span>
                    <span className="font-medium">
                      {detailedCampaign.tracking_links ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tracking opens:</span>
                    <span className="font-medium">
                      {detailedCampaign.tracking_opens ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Text only:</span>
                    <span className="font-medium">
                      {detailedCampaign.text_only ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Match lead ESP:</span>
                    <span className="font-medium">
                      {detailedCampaign.match_esp ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Stop Conditions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {detailedCampaign.stop_on_reply ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <span>Stop on reply</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {detailedCampaign.stop_on_auto_reply ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <span>Stop on auto-reply</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-500">Auto variant select:</span>
                    <span className="font-medium">
                      {detailedCampaign.auto_variant_select ? 'Enabled' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="p-4 space-y-6 focus:outline-none">
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Advanced Settings</h3>
              {detailedCampaign.tags && detailedCampaign.tags.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-500 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailedCampaign.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {detailedCampaign.lead_source && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Lead Source</h4>
                      <div className="text-sm">{detailedCampaign.lead_source}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  No advanced settings are configured for this campaign.
                </div>
              )}
            </div>
          </TabsContent>
          
          {canSeeAssignments && (
            <TabsContent value="assignments" className="p-4 space-y-6 focus:outline-none">
              <div className="bg-white rounded-md border p-4">
                <h3 className="font-medium text-lg mb-4">Campaign Assignments</h3>
                <CampaignAssignmentTab campaignId={detailedCampaign.id} />
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        <DialogFooter className="p-4 border-t bg-gray-50">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal;
