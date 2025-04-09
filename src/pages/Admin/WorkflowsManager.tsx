
import React from 'react';
import { useInstantlyWorkflows } from '@/hooks/use-instantly-workflows';
import { WorkflowsHeader } from '@/components/workflows/WorkflowsHeader';
import { WorkflowsSearch } from '@/components/workflows/WorkflowsSearch';
import { CampaignGrid } from '@/components/workflows/CampaignGrid';
import { AssignCampaignDialog } from '@/components/workflows/AssignCampaignDialog';
import { CampaignDetailsDialog } from '@/components/workflows/CampaignDetailsDialog';
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
    refreshMetricsMutation
  } = useInstantlyWorkflows();

  return (
    <div className="container mx-auto p-6">
      <WorkflowsHeader 
        onRefreshClick={() => refreshMetricsMutation.mutate()}
        isRefreshing={refreshMetricsMutation.isPending}
        refreshError={refreshMetricsMutation.error as Error | null}
      />
      
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
