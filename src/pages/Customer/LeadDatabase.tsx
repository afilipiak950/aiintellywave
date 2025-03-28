
import { useState, useEffect } from 'react';
import { useLeads } from '@/hooks/leads/use-leads';
import { supabase } from '@/integrations/supabase/client';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { useLeadDebug } from '@/hooks/leads/use-debug';

// Imported refactored components
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseDebug from '@/components/customer/LeadDatabaseDebug';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';

interface Project {
  id: string;
  name: string;
}

const LeadDatabase = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
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
    updateLead,
    createLead,
    fetchLeads
  } = useLeads();
  
  console.log('LeadDatabase rendered with', leads.length, 'leads', { leadsLoading });
  
  const forceRefreshLeads = () => {
    console.log('Force refreshing leads...');
    toast({
      title: 'Refreshing Leads',
      description: 'Fetching the latest data from database'
    });
    fetchLeads();
  };
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, company_id')
          .order('name');
        
        if (error) {
          console.error('Error fetching projects:', error);
          throw error;
        }
        
        if (data) {
          console.log('Fetched projects:', data.length);
          // Add all projects plus a special option for leads without projects
          const projectOptions = [
            ...data.map(project => ({
              id: project.id,
              name: project.name
            })),
            {
              id: 'unassigned',
              name: 'Leads without Project'
            }
          ];
          
          setProjects(projectOptions);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  const handleCreateLead = async (leadData) => {
    console.log('Creating lead in LeadDatabase component', leadData);
    return createLead(leadData);
  };
  
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

export default LeadDatabase;
