
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewTabContentProps {
  campaign: any;
  formatDate: (dateString: string) => string;
}

export function OverviewTabContent({ campaign, formatDate }: OverviewTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
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
              <Badge key={index} className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">{tag}</Badge>
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
    </div>
  );
}
