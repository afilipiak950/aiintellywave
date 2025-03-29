
import { useEffect } from 'react';
import { useLeads } from '@/hooks/leads/use-leads';
import { supabase } from '@/integrations/supabase/client';
import { useLeadDebug } from '@/hooks/leads/use-debug';
import { toast } from '@/hooks/use-toast';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';
import { useAuth } from '@/context/auth';

// Imported refactored components
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseDebug from '@/components/customer/LeadDatabaseDebug';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';

const LeadDatabase = () => {
  const { user } = useAuth();
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
  
  // Use the unified leads approach (no separate excel vs regular)
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
    fetchLeads
  } = useLeads({ assignedToUser: true });
  
  console.log('LeadDatabase rendered with', leads.length, 'leads (total:', allLeads.length, ')', { leadsLoading });
  
  const forceRefreshLeads = () => {
    console.log('Force refreshing unified leads...');
    toast({
      title: 'Refreshing Leads',
      description: 'Fetching the latest data from database'
    });
    fetchLeads();
  };
  
  const handleCreateLead = async (leadData) => {
    console.log('Creating lead in LeadDatabase component', leadData);
    return createLead(leadData);
  };
  
  // Automatically refresh leads when component mounts
  useEffect(() => {
    console.log('LeadDatabase component mounted, automatically refreshing leads');
    fetchLeads();
  }, [fetchLeads]);
  
  return (
    <LeadDatabaseContainer>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <LeadDatabaseHeader />
        
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
      
      {/* Lead Grid - explicit lead count message */}
      {leads.length === 0 && !leadsLoading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <p className="text-amber-700">
            No leads found. There are {allLeads.length} total leads in the database, 
            but they may be filtered out by your current filters.
          </p>
          <p className="text-amber-700 mt-1">
            Try adjusting your filters or use the "Refresh Leads" button to reload.
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
