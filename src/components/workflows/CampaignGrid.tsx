
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
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading campaigns</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{error.message}</p>
          <p className="text-sm">Please check your connection to the Instantly API Edge Function and ensure your API key is properly configured.</p>
        </AlertDescription>
      </Alert>
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
