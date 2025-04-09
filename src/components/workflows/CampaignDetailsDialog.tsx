
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InstantlyCampaignDetailedMetrics } from '@/services/instantlyService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CampaignDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: InstantlyCampaignDetailedMetrics | null | undefined;
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
    switch (status?.toLowerCase()) {
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading || !campaign) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <Skeleton className="h-8 w-3/4" />
          </DialogHeader>
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Prepare chart data
  const chartData = campaign.metrics.dailyStats.map(day => ({
    date: formatDate(day.date),
    sent: day.sent,
    opened: day.opened,
    clicked: day.clicked,
    replied: day.replied
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">{campaign.name}</DialogTitle>
            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            <p>Created: {formatDate(campaign.created_at)}</p>
            <p>Last Updated: {formatDate(campaign.updated_at)}</p>
          </div>
        </DialogHeader>

        <Tabs defaultValue="stats">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="performance">Performance Over Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Emails Sent</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-3">
                  <p className="text-2xl font-bold">{campaign.metrics.emailsSent.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Open Rate</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-3">
                  <p className="text-2xl font-bold">{campaign.metrics.openRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Click Rate</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-3">
                  <p className="text-2xl font-bold">{campaign.metrics.clickRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Replies</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-3">
                  <p className="text-2xl font-bold">{campaign.metrics.replies}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            {chartData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Emails Sent" />
                        <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Emails Opened" />
                        <Line type="monotone" dataKey="clicked" stroke="#ffc658" name="Clicks" />
                        <Line type="monotone" dataKey="replied" stroke="#ff8042" name="Replies" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No daily performance data available for this campaign.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
