
import React from 'react';
import { ArrowUpRight, Calendar, Check, Edit, UserPlus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InstantlyCampaign } from '@/services/instantlyService';

interface CampaignCardProps {
  campaign: InstantlyCampaign;
  onAssign: (campaign: InstantlyCampaign) => void;
  onView: (campaign: InstantlyCampaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onAssign,
  onView
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
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
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate" title={campaign.name}>
            {campaign.name}
          </CardTitle>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground flex items-center mt-2">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(campaign.created_at)}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">Sent</div>
            <div className="font-medium">{campaign.metrics.emailsSent.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">Open Rate</div>
            <div className="font-medium">{campaign.metrics.openRate}%</div>
          </div>
          <div className="bg-muted/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">Click Rate</div>
            <div className="font-medium">{campaign.metrics.clickRate}%</div>
          </div>
          <div className="bg-muted/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">Replies</div>
            <div className="font-medium">{campaign.metrics.replies}</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onView(campaign)}
          className="text-xs"
        >
          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
          View Details
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onAssign(campaign)}
          className="text-xs"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          Assign
        </Button>
      </CardFooter>
    </Card>
  );
};
