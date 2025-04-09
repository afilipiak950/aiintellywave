
import React from 'react';
import { useInstantlyWorkflows } from '@/hooks/use-instantly-workflows';
import { WorkflowsHeader } from '@/components/workflows/WorkflowsHeader';
import { WorkflowsSearch } from '@/components/workflows/WorkflowsSearch';
import { CampaignGrid } from '@/components/workflows/CampaignGrid';
import { AssignCampaignDialog } from '@/components/workflows/AssignCampaignDialog';
import { CampaignDetailsDialog } from '@/components/workflows/CampaignDetailsDialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

export default function WorkflowsManager() {
  const {
    campaigns,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCampaign,
    setSelectedCampaign,
    assignModalOpen,
    setAssignModalOpen,
    selectedCustomerId,
    setSelectedCustomerId,
    companies,
    isLoadingCompanies,
    campaignDetails,
    isLoadingDetails,
    handleAssignCampaign,
    handleViewDetails,
    confirmAssignment,
    assignMutation,
    refreshMetricsMutation,
    isApiKeyMissing,
    handleRetry,
    retryCount,
    refetch
  } = useInstantlyWorkflows();

  // Add manual refresh button to handle connection issues
  const handleManualRefresh = () => {
    if (handleRetry) {
      handleRetry();
    } else {
      refetch();
    }
  };

  // Check if the error is a request parsing error
  const isRequestParsingError = error && (
    error.message.includes('parse') || 
    error.message.includes('JSON') || 
    error.message.includes('Unexpected end') ||
    error.message.includes('non-2xx status code')
  );

  return (
    <div className="container mx-auto p-6">
      <WorkflowsHeader 
        onRefreshClick={() => refreshMetricsMutation.mutate()}
        isRefreshing={refreshMetricsMutation.isPending}
        refreshError={refreshMetricsMutation.error as Error | null}
        isApiKeyMissing={isApiKeyMissing}
      />
      
      {isApiKeyMissing && (
        <Alert className="mb-4 border-amber-500 bg-amber-50">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">API Key Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">The Instantly.ai API key needs to be configured in your Supabase Edge Function secrets.</p>
            <div className="bg-amber-100 p-3 rounded text-sm font-mono mb-2">
              supabase secrets set INSTANTLY_API_KEY=your_api_key
            </div>
            <p>You can get your API key from the Instantly.ai dashboard under API integration settings.</p>
          </AlertDescription>
        </Alert>
      )}
      
      {error && !isApiKeyMissing && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading campaigns</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <div className="flex justify-between items-start">
              <div>{(error as Error).message}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh} 
                className="ml-2 whitespace-nowrap"
              >
                Retry {retryCount > 0 ? `(${retryCount})` : ''}
              </Button>
            </div>
            
            {isRequestParsingError && (
              <div className="bg-red-50 p-4 rounded-md space-y-2 mt-2 text-sm">
                <p className="font-semibold">Request parsing error detected:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The Edge Function is having trouble processing the request body</li>
                  <li>This could be due to an empty or malformed request being sent</li>
                  <li>The Content-Type header might be incorrect or missing</li>
                </ul>
                <p className="font-semibold mt-2">Try these troubleshooting steps:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Verify the INSTANTLY_API_KEY is set in your Supabase Edge Function secrets</li>
                  <li>Check the Edge Function logs in the Supabase dashboard for detailed error messages</li>
                  <li>Deploy the Edge Function with the latest code: <span className="font-mono bg-red-100 px-1">supabase functions deploy instantly-ai</span></li>
                  <li>Make sure the content type is set correctly in your request</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <WorkflowsSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <CampaignGrid
        campaigns={campaigns}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onView={handleViewDetails}
        onAssign={handleAssignCampaign}
        error={error as Error | null}
        isApiKeyMissing={isApiKeyMissing}
        onRetry={handleRetry}
      />

      {/* Assign Campaign Dialog */}
      <AssignCampaignDialog
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        campaign={selectedCampaign}
        selectedCompanyId={selectedCustomerId}
        onCompanyChange={setSelectedCustomerId}
        onAssignClick={confirmAssignment}
        companies={companies}
        isLoading={isLoadingCompanies}
        isPending={assignMutation.isPending}
      />

      {/* Campaign Details Dialog */}
      <CampaignDetailsDialog
        open={!!selectedCampaign && !assignModalOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedCampaign(null);
        }}
        campaign={campaignDetails}
        isLoading={isLoadingDetails}
      />
    </div>
  );
}
