
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchCustomerCampaigns, InstantlyCustomerCampaign } from '@/services/instantlyService';

interface CustomerWorkflowsListProps {
  customerId: string;
}

export const CustomerWorkflowsList: React.FC<CustomerWorkflowsListProps> = ({ customerId }) => {
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['customer-campaigns', customerId],
    queryFn: () => fetchCustomerCampaigns(customerId),
    enabled: !!customerId,
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading campaigns: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>No email campaigns have been assigned to this customer yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {campaigns.map((campaign: InstantlyCustomerCampaign) => (
        <Card key={campaign.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{campaign.campaign_name}</CardTitle>
              <Badge className={getStatusColor(campaign.campaign_status)}>
                {campaign.campaign_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {campaign.metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Emails Sent</p>
                  <p className="text-2xl font-semibold">{campaign.metrics.emailsSent.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Open Rate</p>
                  <p className="text-2xl font-semibold">{campaign.metrics.openRate}%</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Click Rate</p>
                  <p className="text-2xl font-semibold">{campaign.metrics.clickRate}%</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Replies</p>
                  <p className="text-2xl font-semibold">{campaign.metrics.replies}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Metrics unavailable for this campaign.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
