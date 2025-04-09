
import React from 'react';
import { useWorkflows } from '@/hooks/use-workflows';
import { WorkflowsHeader } from '@/components/workflows/WorkflowsHeader';
import { WorkflowsSearch } from '@/components/workflows/WorkflowsSearch';
import { WorkflowsGrid } from '@/components/workflows/WorkflowsGrid';
import { useWorkflowActions } from '@/hooks/use-workflow-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WorkflowViewer } from '@/components/workflows/WorkflowViewer';
import { EditWorkflowForm } from '@/components/workflows/EditWorkflowForm';

export default function WorkflowsManagerRefactored() {
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
          <pre className="mt-2 p-2 bg-background text-muted-foreground text-sm overflow-auto max-h-40 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <WorkflowsHeader 
        onRefreshClick={() => syncMutation.mutate()}
        isRefreshing={syncMutation.isPending}
        refreshError={syncMutation.error as Error | null}
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Workflow with Customer</DialogTitle>
            <DialogDescription>
              Select a customer to share "{selectedWorkflow?.name}" workflow with.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCompanies ? (
                  <SelectItem value="loading" disabled>Loading companies...</SelectItem>
                ) : (
                  companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShareWorkflow}
              disabled={shareMutation.isPending || !selectedCompany}
            >
              {shareMutation.isPending ? 'Sharing...' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
