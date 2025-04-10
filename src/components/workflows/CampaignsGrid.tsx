
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
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
                <span className="text-lg mr-2">{campaign.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  campaign.status === 'paused' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 
                  campaign.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {campaign.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{campaign.statistics?.emailsSent || 0}</span> emails sent
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{campaign.statistics?.openRate || 0}%</span> open rate
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{campaign.statistics?.replies || 0}</span> replies
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Updated {formatDate(campaign.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => onView(campaign)}
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};
