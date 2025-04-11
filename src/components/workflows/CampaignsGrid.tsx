
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CampaignsGridProps {
  campaigns: any[];
  isLoading: boolean;
  searchTerm?: string;
  onView: (campaign: any) => void;
  onEditAssignments: (campaign: any) => void;
  dataSource?: string;
}

export const CampaignsGrid: React.FC<CampaignsGridProps> = ({
  campaigns = [],
  isLoading,
  searchTerm = '',
  onView,
  onEditAssignments,
  dataSource
}) => {
  // Filter campaigns based on search term
  const filteredCampaigns = campaigns?.filter(campaign => {
    const searchLower = searchTerm.toLowerCase();
    return (
      campaign.name?.toLowerCase().includes(searchLower) ||
      campaign.description?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-2">
              <Skeleton className="h-28 w-full rounded-md" />
            </CardContent>
            <CardFooter className="p-4 pt-2 flex gap-2 justify-end">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredCampaigns.length === 0) {
    return (
      <div className="text-center p-8">
        {searchTerm ? (
          <p className="text-muted-foreground">No campaigns match your search.</p>
        ) : (
          <p className="text-muted-foreground">No campaigns available.</p>
        )}
      </div>
    );
  }

  return (
    <>
      {dataSource === 'fallback' && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700 text-sm">
          Note: Showing cached campaign data. Some information may not be up to date.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map(campaign => (
          <Card key={campaign.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <Badge variant={campaign.status === 1 ? "default" : "secondary"}>
                  {campaign.status === 1 ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Campaign ID: {campaign.id?.substring(0, 8)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-2">
              <div className="h-28 overflow-hidden">
                {campaign.statistics ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Emails Sent:</span>
                      <span className="font-medium">{campaign.statistics.emailsSent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Opens:</span>
                      <span className="font-medium">{campaign.statistics.opens || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Replies:</span>
                      <span className="font-medium">{campaign.statistics.replies || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Open Rate:</span>
                      <span className="font-medium">{campaign.statistics.openRate || 0}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm text-center">
                      No statistics available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-2 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => onView(campaign)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEditAssignments(campaign)}>
                <Settings className="h-4 w-4 mr-1" />
                Assign
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};
