
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, MessageSquare, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface OverviewTabContentProps {
  campaign: any;
  formatDate: (dateString: string) => string;
}

export function OverviewTabContent({ campaign, formatDate }: OverviewTabContentProps) {
  // Format statistics
  const emailsSent = campaign?.statistics?.emailsSent || 0;
  const replies = campaign?.statistics?.replies || 0;
  const opens = campaign?.statistics?.opens || 0;
  const bounces = campaign?.statistics?.bounces || 0;
  const openRate = campaign?.statistics?.openRate || 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Campaign Statistics</h3>
          
          <div className="flex items-center gap-2 py-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <span className="font-medium mr-2">Emails Sent</span>
            <span className="text-xl font-bold text-blue-600">{emailsSent}</span>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span className="font-medium mr-2">Replies</span>
            <span className="text-xl font-bold text-blue-600">{replies}</span>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <span className="font-medium mr-2">Opens</span>
            <span className="text-xl font-bold text-blue-600">{opens}</span>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <span className="font-medium mr-2">Bounces</span>
            <span className="text-xl font-bold text-blue-600">{bounces}</span>
          </div>
          
          <div className="pt-4">
            <h4 className="text-sm mb-1">Open Rate</h4>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${openRate}%` }}
              />
            </div>
            <div className="text-right text-sm font-medium mt-1">{openRate}%</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Campaign Details</h3>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Created:</span>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(campaign?.created_at)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Updated:</span>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(campaign?.updated_at || campaign?.created_at)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Daily limit:</span>
            <span className="font-medium">{campaign?.daily_limit || 90}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Stop on reply:</span>
            <span className="font-medium">{campaign?.stop_on_reply ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Stop on auto-reply:</span>
            <span className="font-medium">{campaign?.stop_on_auto_reply ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="mt-6">
            <Badge 
              variant={campaign?.status === 1 ? "default" : "secondary"}
              className={cn({
                "bg-green-100 text-green-800 hover:bg-green-200 border-0": campaign?.status === 1,
                "bg-amber-100 text-amber-800 hover:bg-amber-200 border-0": campaign?.status === 2 || campaign?.status === 3,
                "bg-gray-100 text-gray-800 hover:bg-gray-200 border-0": campaign?.status !== 1 && campaign?.status !== 2 && campaign?.status !== 3
              })}
            >
              {campaign?.status === 1 ? "Active" : 
              campaign?.status === 2 || campaign?.status === 3 ? "Paused" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Email Recipients</h3>
        {campaign?.email_list && campaign.email_list.length > 0 ? (
          <div className="space-y-2">
            {campaign.email_list.map((email: string, index: number) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>{email}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">No email recipients</p>
        )}
      </div>
    </div>
  );
}
