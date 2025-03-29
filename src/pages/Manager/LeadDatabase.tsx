
import { useLeads } from '@/hooks/leads/use-leads';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';

// Reuse components from Customer version
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';

const ManagerLeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  } = useManagerProjects();
  
  // Use unified lead fetching
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
    updateLead
  } = useLeads({ assignedToUser: true });
  
  const handleCreateLead = async (leadData) => {
    try {
      const newLead = await createLead(leadData);
      if (newLead) {
        setCreateDialogOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating lead:', error);
      return false;
    }
  };
  
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
        totalLeadCount={allLeads.length}
        filteredCount={leads.length}
      />
      
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

export default ManagerLeadDatabase;
