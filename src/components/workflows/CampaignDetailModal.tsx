import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Clock, 
  Mail, 
  MessagesSquare, 
  User, 
  Calendar, 
  CheckSquare, 
  XCircle,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  if (!campaign) {
    return null;
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return '0%';
    return `${Math.round(value * 10) / 10}%`;
  };
  
  const getStatusColor = (status: string | number) => {
    if (status === 'active' || status === 1) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (status === 'paused' || status === 2) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (status === 'completed' || status === 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (status === 'scheduled' || status === 4) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };
  
  const getStatusLabel = (status: string | number) => {
    if (status === 1) return 'Active';
    if (status === 2) return 'Paused';
    if (status === 3) return 'Completed';
    if (status === 4) return 'Scheduled';
    if (typeof status === 'string') return status;
    return 'Unknown';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Campaign ID: {campaign.id}
              </DialogDescription>
            </div>
            <Badge className={`${getStatusColor(campaign.status)}`}>
              {getStatusLabel(campaign.status)}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="statistics" className="flex-1">Statistics</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            {campaign.sequences && campaign.sequences.length > 0 && (
              <TabsTrigger value="sequences" className="flex-1">Sequences</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Campaign Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Status:</div>
                    <div>{getStatusLabel(campaign.status)}</div>
                    <div className="font-medium">Created:</div>
                    <div>{formatDate(campaign.created_at)}</div>
                    <div className="font-medium">Last Updated:</div>
                    <div>{formatDate(campaign.updated_at)}</div>
                  </div>
                </div>
                
                {campaign.tags && campaign.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {campaign.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {campaign.email_list && campaign.email_list.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Email List ({campaign.email_list.length})</h3>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {campaign.email_list.slice(0, 10).map((email: string, idx: number) => (
                        <div key={idx} className="text-sm py-1 border-b last:border-0">
                          {email}
                        </div>
                      ))}
                      {campaign.email_list.length > 10 && (
                        <div className="text-sm text-muted-foreground pt-1 text-center">
                          + {campaign.email_list.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Performance Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">{campaign.statistics?.emailsSent || 0}</div>
                        <div className="text-xs text-muted-foreground">Emails Sent</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <Eye className="h-5 w-5 text-amber-600" />
                      <div>
                        <div className="text-sm font-medium">{campaign.statistics?.opens || 0}</div>
                        <div className="text-xs text-muted-foreground">Opens</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <MessagesSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm font-medium">{campaign.statistics?.replies || 0}</div>
                        <div className="text-xs text-muted-foreground">Replies</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <div className="text-sm font-medium">{campaign.statistics?.bounces || 0}</div>
                        <div className="text-xs text-muted-foreground">Bounces</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Email Engagement</h3>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Open rate: {formatPercent(campaign.statistics?.openRate)}</span>
                      <span>{campaign.statistics?.opens || 0} opens</span>
                    </div>
                    <Progress 
                      value={campaign.statistics?.openRate || 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Campaign Settings</h3>
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Daily limit:</span>
                      </div>
                      <span>{campaign.daily_limit || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Stop on reply:</span>
                      </div>
                      <span>{campaign.stop_on_reply ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Stop on auto-reply:</span>
                      </div>
                      <span>{campaign.stop_on_auto_reply ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Statistics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Emails Sent</div>
                  <div className="text-2xl font-bold mt-1">{campaign.statistics?.emailsSent || 0}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                  <div className="text-2xl font-bold mt-1">{formatPercent(campaign.statistics?.openRate)}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Replies</div>
                  <div className="text-2xl font-bold mt-1">{campaign.statistics?.replies || 0}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Bounces</div>
                  <div className="text-2xl font-bold mt-1">{campaign.statistics?.bounces || 0}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Engagement Metrics</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Open rate</span>
                      <span>{formatPercent(campaign.statistics?.openRate)}</span>
                    </div>
                    <Progress 
                      value={campaign.statistics?.openRate || 0} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Reply rate</span>
                      <span>
                        {campaign.statistics?.emailsSent 
                          ? formatPercent((campaign.statistics?.replies / campaign.statistics?.emailsSent) * 100) 
                          : '0%'}
                      </span>
                    </div>
                    <Progress 
                      value={campaign.statistics?.emailsSent 
                        ? (campaign.statistics?.replies / campaign.statistics?.emailsSent) * 100 
                        : 0} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Click rate</span>
                      <span>
                        {campaign.statistics?.emailsSent 
                          ? formatPercent((campaign.statistics?.clicks / campaign.statistics?.emailsSent) * 100) 
                          : '0%'}
                      </span>
                    </div>
                    <Progress 
                      value={campaign.statistics?.emailsSent 
                        ? (campaign.statistics?.clicks / campaign.statistics?.emailsSent) * 100 
                        : 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">General Settings</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Campaign Name:</div>
                      <div>{campaign.name}</div>
                      <div className="font-medium">Status:</div>
                      <div>{getStatusLabel(campaign.status)}</div>
                      <div className="font-medium">Daily Limit:</div>
                      <div>{campaign.daily_limit || 'Not set'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Email Options</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Stop on Reply:</div>
                      <div>{campaign.stop_on_reply ? 'Yes' : 'No'}</div>
                      <div className="font-medium">Stop on Auto-Reply:</div>
                      <div>{campaign.stop_on_auto_reply ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {campaign.tags && campaign.tags.length > 0 ? (
                        campaign.tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No tags</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Created:</div>
                      <div>{formatDate(campaign.created_at)}</div>
                      <div className="font-medium">Last Updated:</div>
                      <div>{formatDate(campaign.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {campaign.sequences && campaign.sequences.length > 0 && (
            <TabsContent value="sequences" className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Sequences</h3>
                {campaign.sequences.map((sequence: any, seqIdx: number) => (
                  <div key={seqIdx} className="border rounded-md p-4 space-y-4">
                    <h4 className="font-medium">Sequence {seqIdx + 1}</h4>
                    
                    {sequence.steps && sequence.steps.length > 0 ? (
                      <div className="space-y-4">
                        {sequence.steps.map((step: any, stepIdx: number) => (
                          <div key={stepIdx} className="border-l-2 border-primary pl-4 ml-2 pb-6 relative">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                            <div className="text-sm font-medium mb-1">
                              Step {stepIdx + 1}: {step.type}
                              {step.delay > 0 && ` (Delay: ${step.delay} days)`}
                            </div>
                            
                            {step.variants && step.variants.length > 0 && (
                              <div className="space-y-2">
                                {step.variants.map((variant: any, varIdx: number) => (
                                  <div key={varIdx} className="bg-muted/50 p-3 rounded-md">
                                    <div className="text-sm font-medium mb-1">
                                      Subject: {variant.subject || 'No subject'}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-3">
                                      {variant.body || 'No content'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No steps in this sequence</div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
