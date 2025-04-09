
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { InstantlyCampaignDetailedMetrics } from '@/services/instantlyService';

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
  isLoading,
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
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format data for the chart
  const formatChartData = (campaign: InstantlyCampaignDetailedMetrics | null) => {
    if (!campaign?.metrics?.dailyStats) return [];
    
    return campaign.metrics.dailyStats.map(stat => ({
      date: formatDate(stat.date),
      sent: stat.sent,
      opened: stat.opened,
      clicked: stat.clicked,
      replied: stat.replied
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{campaign?.name || 'Campaign Details'}</span>
            {campaign && (
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !campaign ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="py-4">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm">Total Sent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{campaign.metrics.emailsSent.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm">Open Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{campaign.metrics.openRate}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm">Click Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{campaign.metrics.clickRate}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm">Replies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{campaign.metrics.replies}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Campaign ID</p>
                        <p>{campaign.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p>{campaign.status}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Created At</p>
                        <p>{formatDate(campaign.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Updated At</p>
                        <p>{formatDate(campaign.updated_at)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p>{campaign.metrics.conversionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={formatChartData(campaign)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                        <Bar dataKey="opened" fill="#82ca9d" name="Opens" />
                        <Bar dataKey="clicked" fill="#ffc658" name="Clicks" />
                        <Bar dataKey="replied" fill="#ff8042" name="Replies" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
