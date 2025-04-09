
import React from 'react';
import { CampaignCard } from './CampaignCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InstantlyCampaign } from '@/services/instantlyService';
import { AlertCircle, Settings, Info, XCircle, FileCode, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CampaignGridProps {
  campaigns: InstantlyCampaign[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onAssign: (campaign: InstantlyCampaign) => void;
  onView: (campaign: InstantlyCampaign) => void;
  error?: Error | null;
  isApiKeyMissing?: boolean;
  onRetry?: () => void;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  isLoading,
  searchTerm,
  onAssign,
  onView,
  error,
  isApiKeyMissing,
  onRetry
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
    // Check for specific error types
    const isParseError = error.message.includes('parse') || 
                         error.message.includes('JSON') || 
                         error.message.includes('non-2xx status code');
                         
    const isEmptyBodyError = error.message.includes('Empty request body') ||
                            error.message.includes('Unexpected end of JSON input');
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading campaigns</AlertTitle>
        <AlertDescription className="space-y-4">
          <div className="flex justify-between items-start">
            <p>{error.message}</p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 flex items-center gap-1" 
                onClick={onRetry}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
          
          {isEmptyBodyError && (
            <div className="bg-destructive/10 p-4 rounded-md space-y-2">
              <p className="font-semibold">Request body error:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Edge Function received an empty or malformed request body</li>
                <li>This usually happens when there's an issue with the request format</li>
                <li>The request may be missing Content-Type header or have an incorrect one</li>
              </ul>
              <p className="font-semibold mt-2">Troubleshooting steps:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Check that the INSTANTLY_API_KEY is set in your Supabase Edge Function secrets</li>
                <li>Verify that the Edge Function is properly deployed with the latest code</li>
                <li>Ensure the request has a proper Content-Type: application/json header</li>
                <li>Try refreshing the page and clicking the Retry button above</li>
                <li>Check the Edge Function logs for more specific error details</li>
              </ol>
            </div>
          )}
          
          {isParseError && !isEmptyBodyError && (
            <div className="bg-destructive/10 p-4 rounded-md space-y-2">
              <p className="font-semibold">Request parsing error:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Edge Function is having trouble processing the request</li>
                <li>This could be due to a malformed request body</li>
                <li>The Content-Type header might be missing or incorrect</li>
                <li>There might be network issues affecting the request transmission</li>
              </ul>
              <p className="font-semibold mt-2">Troubleshooting steps:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Check the network tab in browser developer tools to see the request details</li>
                <li>Verify the Edge Function logs for more specific error details</li>
                <li>Ensure the Edge Function is properly deployed and has the latest code</li>
                <li>Try refreshing the page to generate a new request</li>
                <li>Verify that the INSTANTLY_API_KEY is properly set in your Supabase secrets</li>
              </ol>
            </div>
          )}
          
          {isApiKeyMissing && (
            <div className="bg-destructive/10 p-4 rounded-md space-y-2">
              <p className="font-semibold">Possible causes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Instantly API key is not set in your Supabase Edge Function secrets</li>
                <li>The Edge Function is not properly deployed</li>
                <li>There might be a connectivity issue with the Instantly.ai API</li>
                <li>The request format may be invalid or missing required fields</li>
              </ul>
              <p className="font-semibold mt-2">Troubleshooting steps:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Check if the INSTANTLY_API_KEY secret is set in your Supabase dashboard</li>
                <li>Make sure the Edge Function is deployed using <code className="bg-muted p-1 rounded">supabase functions deploy instantly-ai</code></li>
                <li>Verify the API key is valid in the Instantly.ai dashboard</li>
                <li>Check the Edge Function logs for detailed error messages</li>
                <li>If you see "Error parsing request body", ensure your client is sending valid JSON</li>
              </ol>
            </div>
          )}
          
          {error.message.includes('Edge Function') && !isApiKeyMissing && !isParseError && !isEmptyBodyError && (
            <div className="bg-muted p-4 rounded-md">
              <p className="font-semibold">Edge Function Error:</p>
              <p>There seems to be an issue with the Edge Function communication. This could be due to:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>The Edge Function hasn't been deployed yet</li>
                <li>The Edge Function returned an error response</li>
                <li>A network issue between the client and the Edge Function</li>
              </ul>
              <p className="mt-2">Check your Supabase Edge Function logs for more details.</p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="col-span-full text-center py-12 space-y-4">
        <p className="text-muted-foreground text-lg">
          {searchTerm ? 'No campaigns match your search.' : 'No campaigns found.'}
        </p>
        {!searchTerm && (
          <div className="flex flex-col items-center space-y-4">
            <Settings className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground max-w-lg">
              If you have campaigns in your Instantly.ai account, refresh to get the latest data. 
              Otherwise, create campaigns in Instantly.ai first.
            </p>
          </div>
        )}
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
