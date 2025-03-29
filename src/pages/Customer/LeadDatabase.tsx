
import { useEffect } from 'react';
import { useLeads } from '@/hooks/leads/use-leads';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';

// Imported components
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';

const LeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  } = useManagerProjects();
  
  // Use the unified leads approach
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
    updateLead,
    createLead,
    refreshLeads
  } = useLeads({ assignedToUser: true });
  
  // Automatically refresh leads when component mounts - just once
  useEffect(() => {
    console.log('LeadDatabase mounted - fetching leads...');
    refreshLeads();
  }, [refreshLeads]);
  
  // Log before rendering to verify leads are available
  console.log('Rendering LeadDatabase with:', {
    leadsCount: leads?.length || 0,
    allLeadsCount: allLeads?.length || 0,
    loading: leadsLoading,
    projectsLoading
  });
  
  const handleCreateLead = async (leadData) => {
    return createLead(leadData);
  };
  
  return (
    <LeadDatabaseContainer>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <LeadDatabaseHeader />
        
        <LeadDatabaseActions 
          onCreateClick={() => setCreateDialogOpen(true)}
        />
      </div>
      
      {/* Lead Filters */}
      <LeadFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        projects={projects}
      />
      
      {/* Lead Grid - explicit lead count message */}
      {leads.length === 0 && !leadsLoading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <p className="text-amber-700">
            No leads found. There are {allLeads.length} total leads in the database, 
            but they may be filtered out by your current filters.
          </p>
          <p className="text-amber-700 mt-1">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
      
      <LeadGrid 
        leads={leads} 
        onUpdateLead={updateLead}
        loading={leadsLoading || projectsLoading} 
      />
      
      {/* Create Lead Dialog */}
      <LeadCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateLead={handleCreateLead}
        projects={projects}
      />
    </LeadDatabaseContainer>
  );
};

export default LeadDatabase;
