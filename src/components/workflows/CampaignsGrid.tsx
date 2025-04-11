
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Database,
  Eye,
  Inbox,
  Layers,
  Lightbulb,
  MailCheck,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Tag,
  Tags
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CustomerTagsDisplay } from '../ui/customer/CustomerTag';

interface CampaignsGridProps {
  campaigns: any[] | undefined;
  isLoading: boolean;
  searchTerm?: string;
  onView?: (campaign: any) => void;
  dataSource?: string;
  onEditTags?: (campaign: any) => void;
}

// Helper function to convert status to a readable string format
const formatStatus = (status: any): string => {
  // If status is a number, convert to appropriate string
  if (typeof status === 'number') {
    switch (status) {
      case 0: return 'draft';
      case 1: return 'scheduled';
      case 2: return 'active';
      case 3: return 'paused';
      case 4: return 'completed';
      case 5: return 'stopped';
      default: return 'unknown';
    }
  }
  
  // If status is already a string, return it
  if (typeof status === 'string') {
    return status.toLowerCase();
  }
  
  // Default case
  return 'unknown';
};

export const CampaignsGrid: React.FC<CampaignsGridProps> = ({
  campaigns,
  isLoading,
  searchTerm = '',
  onView,
  dataSource,
  onEditTags
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="mb-0">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // If no campaigns available, show message
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="py-8 text-center">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No campaigns found</h3>
        <p className="text-muted-foreground mt-2">
          {searchTerm
            ? `No campaigns matching "${searchTerm}". Try a different search term.`
            : "You don't have any campaigns yet or they haven't synced."
          }
        </p>
      </div>
    );
  }

  // If campaigns are available but using fallback/mock data
  const isMockData = dataSource === 'mock' || dataSource === 'fallback';

  // Filter campaigns based on search term
  const filteredCampaigns = searchTerm
    ? campaigns.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.status && formatStatus(campaign.status).includes(searchTerm.toLowerCase()))
      )
    : campaigns;

  if (filteredCampaigns.length === 0) {
    return (
      <div className="py-8 text-center">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No matching campaigns</h3>
        <p className="text-muted-foreground mt-2">
          No campaigns matching "{searchTerm}". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <>
      {isMockData && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-center gap-2">
          <Database className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-sm font-medium">Using offline data</p>
            <p className="text-xs">
              Could not connect to the Instantly API. Showing locally stored data instead.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => {
          // Format the campaign status
          const statusString = formatStatus(campaign.status);
          
          // Prepare campaign data - handle different API response formats
          const formattedCampaign = {
            id: campaign.id,
            name: campaign.name,
            status: statusString,
            emailsSent: campaign.statistics?.emailsSent || 0,
            openRate: campaign.statistics?.openRate || 0,
            replies: campaign.statistics?.replies || 0,
            tags: Array.isArray(campaign.tags) ? campaign.tags : []
          };

          return (
            <Card key={campaign.id} className="mb-0 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{formattedCampaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(campaign.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  
                  {onEditTags && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView && onView(campaign)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditTags(campaign)}>
                          <Tags className="mr-2 h-4 w-4" />
                          Edit Tags
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    className={
                      formattedCampaign.status === 'active' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : formattedCampaign.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : formattedCampaign.status === 'completed'
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : formattedCampaign.status === 'paused'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }
                  >
                    {formattedCampaign.status.charAt(0).toUpperCase() + formattedCampaign.status.slice(1)}
                  </Badge>
                  
                  {formattedCampaign.emailsSent > 0 && (
                    <Badge variant="outline" className="bg-slate-50">
                      {formattedCampaign.emailsSent} emails
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                {/* Campaign metrics */}
                {formattedCampaign.emailsSent > 0 && (
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Open Rate</span>
                      <span className="text-lg font-semibold">{formattedCampaign.openRate}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Replies</span>
                      <span className="text-lg font-semibold">{formattedCampaign.replies}</span>
                    </div>
                  </div>
                )}
                
                {/* Tags section */}
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Tags:</span>
                  </div>
                  
                  <CustomerTagsDisplay 
                    tags={formattedCampaign.tags} 
                    editable={false}
                    emptyMessage="No tags assigned"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="pb-3 pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => onView && onView(campaign)}
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" /> View Campaign Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
};
