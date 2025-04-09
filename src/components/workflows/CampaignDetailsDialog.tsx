
import React from 'react';
import { InstantlyCampaignDetailedMetrics } from '@/services/instantlyService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CampaignDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: InstantlyCampaignDetailedMetrics | null;
  isLoading: boolean;
}

export const CampaignDetailsDialog: React.FC<CampaignDetailsDialogProps> = ({
  open,
  onOpenChange,
  campaign,
  isLoading
}) => {
  // Get status color
  const getStatusColor = (status: string) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          {isLoading || !campaign ? (
            <>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <DialogTitle>{campaign.name}</DialogTitle>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <DialogDescription>
                Last updated: {new Date(campaign.updated_at).toLocaleString()}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {isLoading || !campaign ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-semibold">{campaign.metrics.emailsSent.toLocaleString()}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-semibold">{campaign.metrics.openRate}%</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-semibold">{campaign.metrics.clickRate}%</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-semibold">{campaign.metrics.conversionRate}%</p>
              </div>
            </div>

            {campaign.metrics.dailyStats && campaign.metrics.dailyStats.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Daily Performance</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={campaign.metrics.dailyStats}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
                      <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Opened" />
                      <Line type="monotone" dataKey="clicked" stroke="#ffc658" name="Clicked" />
                      <Line type="monotone" dataKey="replied" stroke="#ff8042" name="Replied" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
