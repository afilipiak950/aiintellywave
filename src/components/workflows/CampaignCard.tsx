
import React from 'react';
import { InstantlyCampaign } from '@/services/instantlyService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Share2 } from 'lucide-react';

interface CampaignCardProps {
  campaign: InstantlyCampaign;
  onView: () => void;
  onAssign: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onView,
  onAssign
}) => {
  // Get status color
  const getStatusColor = (status: string) => {
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
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{campaign.name}</CardTitle>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Created: {new Date(campaign.created_at).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Emails Sent</p>
            <p className="text-lg font-medium">{campaign.metrics.emailsSent.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Open Rate</p>
            <p className="text-lg font-medium">{campaign.metrics.openRate}%</p>
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Click Rate</p>
            <p className="text-lg font-medium">{campaign.metrics.clickRate}%</p>
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Replies</p>
            <p className="text-lg font-medium">{campaign.metrics.replies}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 pt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button size="sm" onClick={onAssign}>
          <Share2 className="h-4 w-4 mr-2" />
          Assign
        </Button>
      </CardFooter>
    </Card>
  );
};
