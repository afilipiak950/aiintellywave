
import { useState, useEffect, useCallback } from 'react';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

// Imported components
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import LeadImportDialog from '@/components/leads/import/LeadImportDialog';
import LeadDatabaseError from '@/components/leads/LeadDatabaseError';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchLeadsByProjectDirect } from '@/services/leads/lead-fetch';

const LeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  } = useManagerProjects();
  
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const location = useLocation();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState(urlProjectId || 'all');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInProjectContext, setIsInProjectContext] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  useEffect(() => {
    const projectMatch = location.pathname.match(/\/projects\/([^\/]+)/);
    setIsInProjectContext(!!projectMatch);
    
    if (projectMatch && projectMatch[1]) {
      setProjectFilter(projectMatch[1]);
    }
  }, [location.pathname]);
  
  useEffect(() => {
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    
    getUserEmail();
  }, []);
  
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching leads...');
      
      const projectId = projectFilter !== 'all' ? projectFilter : undefined;
      
      if (projectId) {
        try {
          const projectLeads = await fetchLeadsByProjectDirect(projectId);
          setLeads(projectLeads);
          console.log(`Loaded ${projectLeads.length} leads for project ${projectId}`);
          
          setRetryCount(0);
          return;
        } catch (projectError) {
          console.error(`Error fetching leads for project ${projectId}:`, projectError);
          throw projectError; // propagate the error to be caught and displayed
        }
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error('No authenticated user found');
      
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userData.user.id)
        .maybeSingle();
        
      if (companyError) {
        console.error('Error fetching company:', companyError);
        throw new Error(companyError.message || 'Error fetching company data');
      }
      
      if (!companyData?.company_id) {
        throw new Error('No company found for your user account');
      }
      
      const { data: companyProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', companyData?.company_id);
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw new Error(projectsError.message || 'Error fetching company projects');
      }
      
      if (!companyProjects || companyProjects.length === 0) {
        console.log('No projects found for the company');
        setLeads([]);
        throw new Error('No projects found for your company');
      }
      
      let allLeads: Lead[] = [];
      let anyProjectSucceeded = false;
      
      for (const project of companyProjects) {
        try {
          const projectLeads = await fetchLeadsByProjectDirect(project.id);
          allLeads = [...allLeads, ...projectLeads];
          anyProjectSucceeded = true;
        } catch (err) {
          console.warn(`Could not load leads for project ${project.id}:`, err);
        }
      }
      
      if (anyProjectSucceeded) {
        setLeads(allLeads);
        console.log(`Loaded ${allLeads.length} leads across all projects`);
      } else {
        throw new Error('Could not load leads from any project');
      }
      
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching leads:', err);
      
      // Ensure error is properly formatted
      const formattedError = err instanceof Error 
        ? err 
        : new Error(typeof err === 'string' ? err : 'Unknown error fetching leads');
      
      setError(formattedError);
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Error Loading Leads",
        description: formattedError.message || "There was a problem fetching leads. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [projectFilter, setLeads, setError, setRetryCount, setIsRetrying, setIsLoading, toast]);
  
  useEffect(() => {
    if (!leads) return;
    
    let result = [...leads];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(lead => 
        lead.name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower) ||
        lead.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    setFilteredLeads(result);
  }, [leads, searchTerm, statusFilter]);
  
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);
  
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    if (!isInProjectContext) {
      setProjectFilter('all');
    }
    
    localStorage.removeItem('leadSearchTerm');
    localStorage.setItem('leadStatusFilter', 'all');
    if (!isInProjectContext) {
      localStorage.setItem('leadProjectFilter', 'all');
    }
    
    toast({
      title: "Filters Reset",
      description: "All filters have been reset."
    });
  }, [isInProjectContext]);
  
  const handleCreateLead = async (leadData: any) => {
    try {
      if (urlProjectId && !leadData.project_id) {
        leadData.project_id = urlProjectId;
      }
      
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      const processedLead: Lead = {
        ...newLead,
        website: null,
        project_name: projectFilter !== 'all' ? 
          projects.find(p => p.id === (newLead.project_id || projectFilter))?.name || 'Unknown' : 
          'Unassigned',
        extra_data: newLead.extra_data ? 
          (typeof newLead.extra_data === 'string' ? JSON.parse(newLead.extra_data) : newLead.extra_data) : 
          null
      };
      
      if (
        (projectFilter === 'all' || projectFilter === newLead.project_id) &&
        (statusFilter === 'all' || statusFilter === newLead.status)
      ) {
        setLeads(prevLeads => [processedLead, ...prevLeads]);
      }
      
      setCreateDialogOpen(false);
      toast({
        title: "Lead Created",
        description: "New lead has been created successfully."
      });
      
      return processedLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create lead';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data: updatedLead, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) throw error;
      
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === id ? {...lead, ...updatedLead, website: lead.website} as Lead : lead
        )
      );
      
      return updatedLead as Lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lead';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleRetryFetch = () => {
    setIsRetrying(true);
    fetchLeads();
  };
  
  return (
    <LeadDatabaseContainer>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <LeadDatabaseHeader />
        
        <div className="flex items-center gap-2">
          <LeadDatabaseActions 
            onCreateClick={() => setCreateDialogOpen(true)}
            totalLeadCount={leads.length}
            onImportClick={() => setImportDialogOpen(true)}
          />
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRetryFetch}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {userEmail && (
        <Alert className="mt-4 border-blue-100 bg-blue-50">
          <AlertTitle className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
            User Information
          </AlertTitle>
          <AlertDescription>
            <p>You are currently logged in as: <span className="font-mono">{userEmail}</span></p>
            {isInProjectContext && (
              <p className="mt-1">
                Project context detected: <span className="font-mono">{urlProjectId || 'unknown'}</span>
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {error && !isLoading && (
        <LeadDatabaseError 
          error={error}
          retryCount={retryCount}
          onRetry={handleRetryFetch}
          isRetrying={isRetrying}
        />
      )}
      
      <LeadFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        projects={projects}
        totalLeadCount={leads.length}
        filteredCount={filteredLeads.length}
        isInProjectContext={isInProjectContext}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
      />
      
      <LeadGrid 
        leads={filteredLeads}
        onUpdateLead={handleUpdateLead}
        loading={isLoading || projectsLoading} 
        onRetryFetch={handleRetryFetch}
        isRetrying={isRetrying}
        fetchError={error}
        retryCount={retryCount}
      />
      
      <LeadCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateLead={handleCreateLead}
        projects={projects}
        defaultProjectId={urlProjectId} 
      />
      
      <LeadImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onLeadCreated={() => {
          fetchLeads();
        }}
        projectId={projectFilter !== 'all' ? projectFilter : undefined}
      />
    </LeadDatabaseContainer>
  );
};

export default LeadDatabase;
