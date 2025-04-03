
import React from 'react';
import { useWorkflows } from '@/hooks/use-workflows';
import { useWorkflowActions } from '@/hooks/use-workflow-actions';
import { WorkflowsHeader } from '@/components/workflows/WorkflowsHeader';
import { WorkflowsSearch } from '@/components/workflows/WorkflowsSearch';
import { WorkflowsGrid } from '@/components/workflows/WorkflowsGrid';
import { ShareWorkflowDialog } from '@/components/workflows/ShareWorkflowDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WorkflowViewer } from '@/components/workflows/WorkflowViewer';
import { EditWorkflowForm } from '@/components/workflows/EditWorkflowForm';

export default function WorkflowsManager() {
  const {
    filteredWorkflows,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    syncMutation
  } = useWorkflows();
  
  const {
    selectedWorkflow,
    setSelectedWorkflow,
    shareDialogOpen,
    setShareDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    selectedCompany,
    setSelectedCompany,
    companies,
    isLoadingCompanies,
    handleShareWorkflow,
    handleUpdateWorkflow,
    shareMutation,
    updateWorkflowMutation
  } = useWorkflowActions();

  const handleViewWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setViewDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setEditDialogOpen(true);
  };

  const handleShareWorkflowClick = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setShareDialogOpen(true);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Workflow Manager</h1>
        <div className="bg-destructive/20 p-4 rounded-md">
          <p className="text-destructive">Error loading workflows: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <WorkflowsHeader 
        onSyncClick={() => syncMutation.mutate()}
        isSyncing={syncMutation.isPending}
        syncError={syncMutation.error as Error | null}
      />
      
      <WorkflowsSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <WorkflowsGrid
        workflows={filteredWorkflows}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onView={handleViewWorkflow}
        onEdit={handleEditWorkflow}
        onShare={handleShareWorkflowClick}
      />

      <ShareWorkflowDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        selectedWorkflow={selectedWorkflow}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        onShareClick={handleShareWorkflow}
        companies={companies}
        isLoading={isLoadingCompanies}
        isPending={shareMutation.isPending}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Update workflow details
            </DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <EditWorkflowForm 
              workflow={selectedWorkflow} 
              onSubmit={handleUpdateWorkflow} 
              isPending={updateWorkflowMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>
              {selectedWorkflow?.description || 'No description provided'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedWorkflow && <WorkflowViewer workflow={selectedWorkflow} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
