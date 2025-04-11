
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
  Calendar,
  Clock,
  Eye,
  Inbox,
  Mail,
  MailCheck,
  MoreHorizontal,
  MessagesSquare,
  CheckCircle,
  Tag
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
      case 2: return 'paused';  // Changed from 'active' to 'paused' to match Instantly's actual status
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
          <Inbox className="h-5 w-5 text-amber-500" />
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
          
          // Prepare campaign data
          const formattedCampaign = {
            id: campaign.id,
            name: campaign.name,
            status: statusString,
            emailsSent: campaign.statistics?.emailsSent || 0,
            openRate: campaign.statistics?.openRate || 0,
            opens: campaign.statistics?.opens || 0,
            replies: campaign.statistics?.replies || 0,
            dailyLimit: campaign.dailyLimit || campaign.daily_limit || 50,
            date: campaign.date || campaign.updated_at,
            tags: Array.isArray(campaign.tags) ? campaign.tags : [],
            stopOnReply: campaign.stop_on_reply || false
          };

          return (
            <Card key={campaign.id} className="border overflow-hidden">
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">
                    {formattedCampaign.name}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        formattedCampaign.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : formattedCampaign.status === 'paused'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }
                    >
                      {formattedCampaign.status.charAt(0).toUpperCase() + formattedCampaign.status.slice(1)}
                    </Badge>
                    
                    {onEditTags && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditTags(campaign)}>
                            <Tag className="mr-2 h-4 w-4" />
                            Edit Tags
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-4 py-2 space-y-3">
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formattedCampaign.emailsSent} emails sent</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <MessagesSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formattedCampaign.replies} replies</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Open rate: {formattedCampaign.openRate}%</span>
                    <span>{formattedCampaign.opens} opens</span>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(formattedCampaign.openRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Daily limit: {formattedCampaign.dailyLimit}</span>
                  </div>
                  
                  {formattedCampaign.stopOnReply && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Stop on reply</span>
                    </div>
                  )}
                </div>
                
                {formattedCampaign.tags && formattedCampaign.tags.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {formattedCampaign.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between items-center pt-1 pb-3 px-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {new Date(formattedCampaign.date).toLocaleDateString()}
                  </span>
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-gray-600"
                  onClick={() => onView && onView(campaign)}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" /> Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
};
