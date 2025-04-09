
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowsHeaderProps {
  onRefreshClick: () => void;
  isRefreshing: boolean;
  refreshError: Error | null;
  isApiKeyMissing?: boolean;
}

export const WorkflowsHeader: React.FC<WorkflowsHeaderProps> = ({
  onRefreshClick,
  isRefreshing,
  refreshError,
  isApiKeyMissing
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and assign campaigns from Instantly.ai
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onRefreshClick} 
                disabled={isRefreshing || isApiKeyMissing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
              </Button>
            </TooltipTrigger>
            {isApiKeyMissing && (
              <TooltipContent>
                <p>API key configuration required before refreshing</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {refreshError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Refresh failed</AlertTitle>
          <AlertDescription>
            {refreshError.message}
          </AlertDescription>
        </Alert>
      )}

      {isApiKeyMissing && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>The Instantly.ai API key needs to be configured in your Supabase Edge Function secrets.</p>
            <div className="mt-2 bg-muted p-3 rounded text-sm">
              <p className="font-mono">supabase secrets set INSTANTLY_API_KEY=your_api_key</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You can get your API key from the Instantly.ai dashboard under API integration settings.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
