
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Activity, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampaignCardProps {
  campaign: any;
  onView: (campaign: any) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onView
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description || 'No description provided'}
            </p>
          </div>
          {campaign.is_active ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
          ) : (
            <Badge variant="outline">{campaign.status || 'Inactive'}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>
            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
          </span>
        </div>
        
        {campaign.statistics && (
          <div className="flex items-center text-sm">
            <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              {campaign.statistics.sent_count !== undefined && (
                <div className="flex flex-col">
                  <span className="font-medium">Sent</span>
                  <span>{campaign.statistics.sent_count}</span>
                </div>
              )}
              {campaign.statistics.opened_count !== undefined && (
                <div className="flex flex-col">
                  <span className="font-medium">Opened</span>
                  <span>{campaign.statistics.opened_count}</span>
                </div>
              )}
              {campaign.statistics.reply_count !== undefined && (
                <div className="flex flex-col">
                  <span className="font-medium">Replies</span>
                  <span>{campaign.statistics.reply_count}</span>
                </div>
              )}
              {campaign.statistics.bounce_count !== undefined && (
                <div className="flex flex-col">
                  <span className="font-medium">Bounces</span>
                  <span>{campaign.statistics.bounce_count}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {campaign.tags && campaign.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="ghost" size="sm" onClick={() => onView(campaign)} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

interface CampaignsGridProps {
  campaigns: any[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onView: (campaign: any) => void;
}

export const CampaignsGrid: React.FC<CampaignsGridProps> = ({
  campaigns,
  isLoading,
  searchTerm,
  onView
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        {searchTerm ? 'No campaigns match your search.' : 'No campaigns found. Sync campaigns to get started.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard 
          key={campaign.id}
          campaign={campaign}
          onView={() => onView(campaign)}
        />
      ))}
    </div>
  );
};
