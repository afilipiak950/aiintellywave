
import { useEffect } from 'react';
import { useLeads } from '@/hooks/leads/use-leads';
import { supabase } from '@/integrations/supabase/client';
import { useLeadDebug } from '@/hooks/leads/use-debug';
import { toast } from '@/hooks/use-toast';

// Reuse components from Customer version
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseDebug from '@/components/customer/LeadDatabaseDebug';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';

const ManagerLeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  } = useManagerProjects();
  
  const {
    debugInfo,
    setDebugInfo,
    createTestLead,
    debugDatabaseAccess
  } = useLeadDebug();
  
  const {
    leads,
    loading: leadsLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    createLead,
    updateLead,
    fetchLeads
  } = useLeads({ assignedToUser: true });
  
  console.log('ManagerLeadDatabase rendered with', leads.length, 'leads', { leadsLoading });
  
  const forceRefreshLeads = () => {
    console.log('Force refreshing leads...');
    toast({
      title: 'Refreshing Leads',
      description: 'Fetching the latest data from database'
    });
    fetchLeads();
  };
  
  const handleCreateLead = async (leadData) => {
    console.log('Creating lead in ManagerLeadDatabase component', leadData);
    return createLead(leadData);
  };
  
  // Automatically refresh leads when component mounts
  useEffect(() => {
    console.log('ManagerLeadDatabase component mounted, automatically refreshing leads');
    fetchLeads();
  }, [fetchLeads]);
  
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
          onTestDirectLeadCreation={createTestLead}
          onDebugDatabaseAccess={debugDatabaseAccess}
          onForceRefreshLeads={forceRefreshLeads}
        />
      </div>
      
      {/* Debug Information Panel */}
      <LeadDatabaseDebug 
        debugInfo={debugInfo} 
        onClose={() => setDebugInfo(null)} 
      />
      
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
      
      {/* Lead Grid */}
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
