import { useState, useEffect } from 'react';
import { useLeads } from '@/hooks/use-leads';
import { supabase } from '@/integrations/supabase/client';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/lead';
import { useAuth } from '@/context/auth';

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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
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
  
  // Debug function to test direct database access
  const testDirectLeadCreation = async () => {
    try {
      const testLead = {
        name: `Test Lead ${Date.now()}`,
        company: 'Test Company',
        email: 'test@example.com',
        status: 'new' as LeadStatus,
        phone: '123-456-7890',
        position: 'Test Position',
        notes: 'Created for debugging purposes',
        score: 50
      };
      
      console.log('Attempting direct lead creation with:', testLead);
      
      const { data, error } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();
        
      if (error) {
        console.error('Direct lead creation error:', error);
        toast({
          title: 'Database Error',
          description: `Error: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        console.log('Direct lead creation successful:', data);
        toast({
          title: 'Test Lead Created',
          description: 'Direct database insertion successful'
        });
        
        // Refresh leads
        fetchLeads();
      }
    } catch (err) {
      console.error('Exception in direct lead creation:', err);
    }
  };
  
  // Debug function to test database access
  const debugDatabaseAccess = async () => {
    try {
      console.log('Checking database access...');
      setDebugInfo({ status: 'loading' });
      
      // First check auth status
      const debugData: any = {
        auth: {
          userId: user?.id,
          email: user?.email,
          isAuthenticated: !!user
        }
      };
      
      // Test projects access
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, company_id')
        .limit(5);
        
      debugData.projects = { 
        success: !projectsError, 
        count: projectsData?.length || 0,
        error: projectsError?.message,
        data: projectsData
      };
      
      console.log('Projects query result:', debugData.projects);
      
      // Test direct leads access
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .limit(5);
        
      debugData.leads = { 
        success: !leadsError, 
        count: leadsData?.length || 0,
        error: leadsError?.message,
        data: leadsData
      };
      
      console.log('Direct leads query result:', debugData.leads);
      
      // Test RLS policies using our edge function
      try {
        const { data: rlsData, error: rlsError } = await supabase.functions.invoke('check-rls', {
          method: 'POST'
        });
        
        debugData.rls = {
          success: !rlsError,
          data: rlsData,
          error: rlsError?.message
        };
      } catch (error) {
        console.error('Error calling check-rls function:', error);
        debugData.rls = {
          success: false,
          error: error.message || 'Error calling check-rls function'
        };
      }
      
      setDebugInfo(debugData);
      
      toast({
        title: 'Database Check Complete',
        description: `Projects: ${!projectsError ? projectsData?.length : 'Error'}, Leads: ${!leadsError ? leadsData?.length : 'Error'}`,
      });
    } catch (err) {
      console.error('Exception in database debug:', err);
      setDebugInfo({ status: 'error', error: err.message });
    }
  };
  
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
          onTestDirectLeadCreation={testDirectLeadCreation}
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
