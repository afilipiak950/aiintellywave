
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
import { Calendar, Eye, Mail, MessageSquare, Tag } from 'lucide-react';

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
          <Card key={campaign.id} className="border overflow-hidden rounded-md shadow-sm">
            <CardHeader className="pb-0 pt-5 px-5">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-base font-medium mb-0" title={campaign.name}>
                  {campaign.name}
                </CardTitle>
                <Badge 
                  variant="outline"
                  className="bg-amber-50 text-amber-800 border-amber-200 font-normal text-xs px-2"
                >
                  {status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="px-5 pt-2 pb-3">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <span>{campaign.emailsSent || 0} emails sent</span>
                </div>
                <div className="flex items-center justify-end text-xs text-gray-500">
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <span>{campaign.replies || 0} replies</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center text-xs text-gray-500">
                  <span>Open rate: {campaign.openRate || 0}%</span>
                </div>
                <div className="flex items-center justify-end text-xs text-gray-500">
                  <span>{campaign.opens || 0} opens</span>
                </div>
              </div>
              
              {(campaign.dailyLimit || campaign.stopOnReply) && (
                <div className="grid grid-cols-2 gap-2 mt-3 border-t pt-2">
                  {campaign.dailyLimit && (
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Daily limit: {campaign.dailyLimit}</span>
                    </div>
                  )}
                  {campaign.stopOnReply && (
                    <div className="flex items-center justify-end text-xs text-green-600">
                      <span>Stop on reply</span>
                    </div>
                  )}
                </div>
              )}
              
              {campaign.tags && campaign.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t">
                  <Tag className="h-3.5 w-3.5 text-gray-400 mr-1" />
                  {campaign.tags.map((tag: string, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="px-5 pt-0 pb-4 flex items-center justify-between border-t">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                {new Date(campaign.created_at || campaign.timestamp_created).toLocaleDateString()}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-7 rounded-md"
                onClick={() => onView(campaign)}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Details
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
