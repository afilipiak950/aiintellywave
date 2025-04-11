
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Mail, 
  User, 
  BarChart, 
  MessagesSquare, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Tag,
  ExternalLink,
  MessageSquare,
  Code
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  if (!campaign) return null;
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Get status color based on campaign status
  const getStatusColor = (status: string | number) => {
    if (status === 'active' || status === 1) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (status === 'paused' || status === 2) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (status === 'completed' || status === 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (status === 'scheduled' || status === 4) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };
  
  // Format status label
  const getStatusLabel = (status: string | number) => {
    if (status === 1) return 'Active';
    if (status === 2) return 'Paused';
    if (status === 3) return 'Completed';
    if (status === 4) return 'Scheduled';
    if (typeof status === 'string') return status;
    return 'Unknown';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
            <Badge className={`${getStatusColor(campaign.status)}`}>
              {getStatusLabel(campaign.status)}
            </Badge>
          </div>
          <DialogDescription>
            Campaign ID: {campaign.id}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sequences">Sequences</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Campaign Statistics</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Emails Sent</span>
                      <span className="text-lg font-semibold flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        {campaign.statistics?.emailsSent || 0}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Replies</span>
                      <span className="text-lg font-semibold flex items-center">
                        <MessagesSquare className="h-4 w-4 mr-2 text-primary" />
                        {campaign.statistics?.replies || 0}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Opens</span>
                      <span className="text-lg font-semibold flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                        {campaign.statistics?.opens || 0}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Bounces</span>
                      <span className="text-lg font-semibold flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-primary" />
                        {campaign.statistics?.bounces || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Open Rate</span>
                      <span>{campaign.statistics?.openRate || 0}%</span>
                    </div>
                    <Progress value={campaign.statistics?.openRate || 0} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Campaign Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {formatDate(campaign.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {formatDate(campaign.updated_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily limit:</span>
                    <span className="font-medium">{campaign.daily_limit || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stop on reply:</span>
                    <span>{campaign.stop_on_reply ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stop on auto-reply:</span>
                    <span>{campaign.stop_on_auto_reply ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {campaign.tags && campaign.tags.length > 0 && (
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {campaign.email_list && campaign.email_list.length > 0 && (
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Email Recipients</h3>
                <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                  {campaign.email_list.slice(0, 10).map((email: string, idx: number) => (
                    <div key={idx} className="flex items-center text-sm">
                      <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      {email}
                    </div>
                  ))}
                  {campaign.email_list.length > 10 && (
                    <div className="text-sm text-muted-foreground italic">
                      +{campaign.email_list.length - 10} more recipients
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sequences" className="space-y-4">
            {campaign.sequences && campaign.sequences.length > 0 ? (
              campaign.sequences.map((sequence: any, seqIdx: number) => (
                <div key={seqIdx} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Sequence {seqIdx + 1}</h3>
                  
                  {sequence.steps && sequence.steps.length > 0 ? (
                    <div className="space-y-6">
                      {sequence.steps.map((step: any, stepIdx: number) => (
                        <div key={stepIdx} className="relative">
                          {stepIdx > 0 && (
                            <div className="absolute left-5 -top-4 h-4 w-0.5 bg-muted-foreground/30"></div>
                          )}
                          <div className="flex items-start">
                            <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center shrink-0 mt-1">
                              {step.type === 'email' ? (
                                <Mail className="h-5 w-5" />
                              ) : (
                                <MessageSquare className="h-5 w-5" />
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center">
                                <h4 className="font-medium">
                                  {step.type === 'email' ? 'Email' : step.type} {stepIdx + 1}
                                </h4>
                                {step.delay > 0 && (
                                  <Badge variant="outline" className="ml-3 text-xs">
                                    Wait {step.delay} day{step.delay !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              
                              {step.variants && step.variants.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {step.variants.map((variant: any, varIdx: number) => (
                                    <div key={varIdx} className="bg-muted/40 p-3 rounded text-sm">
                                      <p className="font-medium mb-1">Subject: {variant.subject}</p>
                                      <Separator className="my-2" />
                                      <div className="text-muted-foreground text-xs">
                                        {variant.body?.replace(/<[^>]*>/g, '') || 'No body content'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No steps defined for this sequence.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sequence data available for this campaign.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Schedule Settings</h3>
              <div className="space-y-2">
                {campaign.schedule && campaign.schedule.schedules && campaign.schedule.schedules.length > 0 ? (
                  campaign.schedule.schedules.map((schedule: any, idx: number) => (
                    <div key={idx} className="border rounded p-3">
                      <div className="font-medium text-sm mb-2">{schedule.name || `Schedule ${idx + 1}`}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Time:</span>{' '}
                          {schedule.timing?.from} - {schedule.timing?.to}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timezone:</span>{' '}
                          {schedule.timezone || 'Default'}
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Days:</span>{' '}
                          {schedule.days ? Object.entries(schedule.days)
                            .filter(([_, active]) => active)
                            .map(([day]) => {
                              const dayMap: Record<string, string> = {
                                '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat'
                              };
                              return dayMap[day] || day;
                            }).join(', ') : 'None'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No schedule information available.</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Sending Settings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily limit:</span>
                    <span>{campaign.daily_limit || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking links:</span>
                    <span>{campaign.link_tracking ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking opens:</span>
                    <span>{campaign.open_tracking ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Text only:</span>
                    <span>{campaign.text_only ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Match lead ESP:</span>
                    <span>{campaign.match_lead_esp ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Stop Conditions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    {campaign.stop_on_reply ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    <span>Stop on reply</span>
                  </div>
                  <div className="flex items-center">
                    {campaign.stop_on_auto_reply ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    <span>Stop on auto-reply</span>
                  </div>
                  <div className="flex items-center mt-3">
                    <span className="text-muted-foreground mr-2">Auto variant select:</span>
                    <span>
                      {campaign.auto_variant_select?.trigger || 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Raw Data (JSON)</h3>
                <Badge variant="outline" className="text-xs">Advanced</Badge>
              </div>
              <div className="bg-black/90 text-gray-300 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(campaign.raw_data, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="bg-muted/40 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">API Reference</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Access this campaign via the Instantly API:
                </p>
                <div className="bg-black/90 text-gray-300 p-3 rounded overflow-x-auto">
                  <code className="text-xs font-mono">
                    GET https://api.instantly.ai/api/v2/campaigns/{campaign.id}
                  </code>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://developer.instantly.ai/api/v2/campaign/getcampaign', '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  API Documentation
                </Button>
              </div>
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
