
import React from 'react';
import { CampaignCard } from './CampaignCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InstantlyCampaign } from '@/services/instantlyService';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CampaignGridProps {
  campaigns: InstantlyCampaign[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onAssign: (campaign: InstantlyCampaign) => void;
  onView: (campaign: InstantlyCampaign) => void;
  error?: Error | null;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  isLoading,
  searchTerm,
  onAssign,
  onView,
  error
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
              <div className="border-t p-4 flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    // Enhanced error UI with more specific troubleshooting guidance
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <CardTitle className="text-destructive text-lg">Edge Function Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">There was an error connecting to the Instantly API Edge Function:</p>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap mb-4">
            {error.message}
          </pre>
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Make sure the Edge Function <code>instantly-api</code> is properly deployed.</li>
              <li>Verify the Instantly API key is correctly set in Supabase secrets.</li>
              <li>Check the Supabase Edge Function logs for more details.</li>
              <li>Try refreshing the page or redeploying the Edge Function.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        {searchTerm ? 'No campaigns match your search.' : 'No campaigns found. Refresh to get the latest campaigns.'}
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
          onAssign={() => onAssign(campaign)}
        />
      ))}
    </div>
  );
};
