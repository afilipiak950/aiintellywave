import { useLeads } from '@/hooks/leads/use-leads';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

// Reuse components from Customer version
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import LeadImportDialog from '@/components/leads/import/LeadImportDialog';
import LeadErrorHandler from '@/components/leads/LeadErrorHandler';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const ManagerLeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  } = useManagerProjects();
  
  // Use unified lead fetching with limit parameter
  const {
    leads,
    allLeads,
    loading: leadsLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    createLead,
    updateLead,
    duplicatesCount,
    fetchLeads,
    fetchError,
    retryCount,
    isRetrying
  } = useLeads({ 
    assignedToUser: true,
    limit: 100,
    refreshInterval: null // Don't auto-refresh initially
  });
  
  // Add state for import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const handleCreateLead = async (leadData: any) => {
    try {
      const newLead = await createLead(leadData);
      if (newLead) {
        setCreateDialogOpen(false);
        toast({
          title: "Lead Created",
          description: "New lead has been created successfully."
        });
      }
      return newLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleRetryFetch = () => {
    fetchLeads();
    toast({
      title: "Retrying",
      description: "Fetching leads again..."
    });
  };
  
  // Show error state when there's an error fetching leads
  const hasError = !!fetchError && !isRetrying;
  
  return (
    <LeadDatabaseContainer>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <LeadDatabaseHeader 
          title="Lead Database"
          subtitle="Manage and track all leads across your projects"
        />
        
        <LeadDatabaseActions 
          onCreateClick={() => setCreateDialogOpen(true)}
          totalLeadCount={allLeads.length}
          onImportClick={() => setImportDialogOpen(true)}
        />
      </div>
      
      {/* Error Message with Retry Button */}
      {hasError && (
        <LeadErrorHandler
          error={fetchError}
          retryCount={retryCount}
          onRetry={handleRetryFetch}
          isRetrying={isRetrying}
        />
      )}
      
      {/* Lead Filters */}
      <LeadFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        projects={projects}
        totalLeadCount={allLeads.length}
        filteredCount={leads.length}
        duplicatesCount={duplicatesCount}
      />
      
      <LeadGrid 
        leads={leads} 
        onUpdateLead={updateLead}
        loading={leadsLoading || projectsLoading || isRetrying} 
        onRetryFetch={handleRetryFetch}
        isRetrying={isRetrying}
        fetchError={fetchError}
        retryCount={retryCount}
      />
      
      {/* Create Lead Dialog */}
      <LeadCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateLead={handleCreateLead}
        projects={projects}
      />
      
      {/* Import Lead Dialog */}
      <LeadImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onLeadCreated={() => {
          // No need to call fetchLeads - the real-time subscription will handle updates
        }}
        projectId={projectFilter !== 'all' ? projectFilter : undefined}
      />
    </LeadDatabaseContainer>
  );
};

export default ManagerLeadDatabase;
