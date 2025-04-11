
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Clock, 
  Eye, 
  RefreshCw, 
  User, 
  Mail,
  AlertTriangle,
  Calendar,
  MessagesSquare,
  CheckSquare,
  XCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CampaignGridProps {
  campaigns: any[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onView: (campaign: any) => void;
  dataSource?: string;
}

export const CampaignsGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  isLoading,
  searchTerm,
  onView,
  dataSource = 'api'
}) => {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format percentages
  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return '0%';
    return `${Math.round(value * 10) / 10}%`;
  };
  
  // Get status color based on campaign status
  const getStatusColor = (status: string | number) => {
    if (status === 'active' || status === 1) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (status === 'paused' || status === 2) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (status === 'completed' || status === 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (status === 'scheduled' || status === 4) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };
  
  // Format status label
  const getStatusLabel = (status: string | number) => {
    if (status === 1) return 'Active';
    if (status === 2) return 'Paused';
    if (status === 3) return 'Completed';
    if (status === 4) return 'Scheduled';
    if (typeof status === 'string') return status;
    return 'Unknown';
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Show empty state if no campaigns found with search filter
  if (!campaigns || campaigns.length === 0) {
    if (searchTerm) {
      return (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No campaigns match your search.
        </div>
      );
    }
    
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        <div className="max-w-lg mx-auto">
          <Alert variant="default" className="mb-4 bg-muted">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>No campaigns found</AlertTitle>
            <AlertDescription>
              We couldn't find any campaigns. Click the "Sync Campaigns" button to fetch data from Instantly.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check if we're showing mock/fallback data
  const isShowingCachedData = dataSource === 'mock' || dataSource === 'fallback';

  return (
    <>
      {isShowingCachedData && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-300">
          <p className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-bold">Using cached campaign data</span>
          </p>
          <p className="text-sm mt-1">
            Could not connect to Instantly API. Showing locally cached data instead.
            Please check your API key configuration and network connectivity.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-start">
                <span className="text-lg font-medium truncate mr-2">{campaign.name}</span>
                <Badge className={`${getStatusColor(campaign.status)}`}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </CardTitle>
              {campaign.tags && campaign.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {campaign.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {campaign.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{campaign.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{campaign.statistics?.emailsSent || 0}</span> emails sent
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MessagesSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{campaign.statistics?.replies || 0}</span> replies
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Open rate: {formatPercent(campaign.statistics?.openRate)}</span>
                    <span>{campaign.statistics?.opens || 0} opens</span>
                  </div>
                  <Progress 
                    value={campaign.statistics?.openRate || 0} 
                    className="h-1.5" 
                  />
                </div>
                
                {campaign.daily_limit > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Daily limit: {campaign.daily_limit}
                    </span>
                    
                    <div className="flex items-center gap-4">
                      {campaign.stop_on_reply && (
                        <span className="flex items-center">
                          <CheckSquare className="h-3 w-3 mr-1 text-green-500" />
                          Stop on reply
                        </span>
                      )}
                      
                      {campaign.stop_on_auto_reply && (
                        <span className="flex items-center">
                          <XCircle className="h-3 w-3 mr-1 text-red-500" />
                          Stop on auto-reply
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3 flex justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {formatDate(campaign.updated_at)}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => onView(campaign)}
              >
                <Eye className="h-3.5 w-3.5" />
                Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};
