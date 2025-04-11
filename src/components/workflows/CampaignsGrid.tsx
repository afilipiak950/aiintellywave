
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Tag } from 'lucide-react';

interface CampaignsGridProps {
  campaigns?: any[];
  isLoading: boolean;
  searchTerm?: string;
  onView: (campaign: any) => void;
  dataSource?: string;
  onEditTags?: (campaign: any) => void;
}

export const CampaignsGrid: React.FC<CampaignsGridProps> = ({
  campaigns = [],
  isLoading,
  searchTerm = '',
  onView,
  dataSource,
  onEditTags
}) => {
  // Filter campaigns by search term
  const filteredCampaigns = campaigns.filter(campaign => {
    if (!searchTerm) return true;
    
    // Convert search term to lowercase for case-insensitive search
    const term = searchTerm.toLowerCase();
    
    // Check if the name, description, or tags include the search term
    return (
      (campaign.name && campaign.name.toLowerCase().includes(term)) ||
      (campaign.description && campaign.description.toLowerCase().includes(term)) ||
      (campaign.tags && campaign.tags.some((tag: string) => tag.toLowerCase().includes(term)))
    );
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <Card key={index} className="p-0 overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (filteredCampaigns.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No Campaigns Found</h3>
        <p className="text-muted-foreground">
          {searchTerm 
            ? `No campaigns matching "${searchTerm}"` 
            : "No campaigns are available."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCampaigns.map((campaign) => {
        // Determine status display
        const status = typeof campaign.status === 'number' 
          ? campaign.status === 1 ? 'Active' : 'Paused'
          : campaign.status || 'Unknown';
        
        return (
          <Card key={campaign.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg truncate" title={campaign.name}>
                  {campaign.name}
                </CardTitle>
                <Badge 
                  variant={status === 'Active' ? "default" : "secondary"}
                  className={status === 'Active' ? "bg-green-500 text-white" : ""}
                >
                  {status}
                </Badge>
              </div>
              <CardDescription>
                {new Date(campaign.created_at || campaign.timestamp_created).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.tags && campaign.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground mr-1" />
                  {campaign.tags.map((tag: string, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {campaign.description ? (
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onView(campaign)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              
              {onEditTags && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditTags(campaign)}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Edit Tags
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
