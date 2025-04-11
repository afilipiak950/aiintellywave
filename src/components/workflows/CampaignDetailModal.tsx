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
  Building,
  X
} from "lucide-react";
import { useCampaignCompanies } from '@/hooks/use-campaign-companies';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedDate } from '../ui/formatted-date';
import { MultiSelect } from '../ui/multiselect';

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
  
  const { 
    companies,
    isLoadingCompanies,
    assignedCompanyIds,
    isLoadingAssignments,
    updateCampaignCompanies,
    isUpdating
  } = useCampaignCompanies(campaign?.id);
  
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
  
  const handleSaveCompanies = async () => {
    await updateCampaignCompanies(assignedCompanyIds);
  };
  
  // Transform companies for MultiSelect
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));
  
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
            <TabsTrigger value="companies" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Companies
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-4 space-y-6 focus:outline-none">
            <div className="grid grid-cols-2 gap-6">
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
          </TabsContent>
          
          <TabsContent value="settings" className="p-4 space-y-6 focus:outline-none">
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
          
          <TabsContent value="advanced" className="p-4 space-y-6 focus:outline-none">
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Advanced Settings</h3>
              <div className="text-muted-foreground">
                No advanced settings are configured for this campaign.
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="companies" className="p-4 space-y-6 focus:outline-none">
            <div className="bg-white rounded-md border p-4">
              <h3 className="font-medium text-lg mb-4">Campaign Companies</h3>
              <p className="text-sm text-gray-500 mb-4">
                Assign companies to make this campaign visible to specific customer companies
              </p>
              
              <div className="mb-4">
                <MultiSelect
                  options={companyOptions}
                  selected={assignedCompanyIds}
                  onChange={(selected) => updateCampaignCompanies(selected)}
                  placeholder="Select companies..."
                  emptyMessage="No companies available"
                  isLoading={isLoadingCompanies || isLoadingAssignments}
                  disabled={isUpdating}
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Note: Campaigns will only be visible to the selected customer companies.</p>
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
