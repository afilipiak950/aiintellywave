
import React from 'react';
import { useInstantlyWorkflows } from '@/hooks/use-instantly-workflows';
import { WorkflowsHeader } from '@/components/workflows/WorkflowsHeader';
import { WorkflowsSearch } from '@/components/workflows/WorkflowsSearch';
import { CampaignGrid } from '@/components/workflows/CampaignGrid';
import { AssignCampaignDialog } from '@/components/workflows/AssignCampaignDialog';
import { CampaignDetailsDialog } from '@/components/workflows/CampaignDetailsDialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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

  return (
    <div className="container mx-auto p-6">
      <WorkflowsHeader 
        onRefreshClick={() => refreshMetricsMutation.mutate()}
        isRefreshing={refreshMetricsMutation.isPending}
        refreshError={refreshMetricsMutation.error as Error | null}
        isApiKeyMissing={isApiKeyMissing}
      />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading campaigns</AlertTitle>
          <AlertDescription className="flex justify-between items-start">
            <div>{(error as Error).message}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh} 
              className="ml-2"
            >
              Retry
            </Button>
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
