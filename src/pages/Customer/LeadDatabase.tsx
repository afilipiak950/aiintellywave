
import { useState, useEffect, useCallback, useRef } from 'react';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

// Import updated components and utilities
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import LeadImportDialog from '@/components/leads/import/LeadImportDialog';
import LeadErrorHandler from '@/components/leads/LeadErrorHandler';
import LeadDatabaseFallback from '@/components/leads/LeadDatabaseFallback';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  getProjectLeadsDirectly, 
  getUserProjects,
  getDiagnosticInfo 
} from '@/components/leads/lead-error-utils';

const LeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen,
    fetchProjects,
    projectsError
  } = useManagerProjects();
  
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const location = useLocation();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const initialLoadAttemptedRef = useRef(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState(urlProjectId || 'all');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInProjectContext, setIsInProjectContext] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  
  // Check if we're in a project-specific page
  useEffect(() => {
    const projectMatch = location.pathname.match(/\/projects\/([^\/]+)/);
    setIsInProjectContext(!!projectMatch);
    
    if (projectMatch && projectMatch[1]) {
      setProjectFilter(projectMatch[1]);
    }
  }, [location.pathname]);
  
  // Get user email for display - only once
  useEffect(() => {
    if (userEmail !== null) return;
    
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    
    getUserEmail();
  }, [userEmail]);
  
  // Fetch diagnostic info at the start to help troubleshoot issues - only once
  useEffect(() => {
    if (diagnosticInfo !== null) return;
    
    const loadDiagnostics = async () => {
      const info = await getDiagnosticInfo();
      setDiagnosticInfo(info);
      console.log('Diagnostic info:', info);
    };
    
    loadDiagnostics();
  }, [diagnosticInfo]);
  
  // The main fetch leads function
  const fetchLeads = useCallback(async () => {
    // Prevent duplicate fetches
    if (isRetrying) return;
    
    setIsLoading(true);
    setIsRetrying(true);
    setError(null);
    
    try {
      console.log('Fetching leads...');
      
      // If we have no projects, we need to fetch them first
      if ((!projects || projects.length === 0) && !projectsLoading) {
        console.log('No projects loaded, fetching projects first...');
        
        // Check if we have a fetchProjects function from the hook
        if (typeof fetchProjects === 'function') {
          await fetchProjects();
        }
        
        // If projects still not available, try getting projects directly
        const directProjects = await getUserProjects();
        
        if (directProjects.length === 0) {
          throw new Error('Keine Projekte für Ihr Konto gefunden');
        }
        
        console.log('Found projects directly:', directProjects.length);
      }
      
      // If we have a specific project, use the direct method first
      const projectId = projectFilter !== 'all' ? projectFilter : undefined;
      
      if (projectId) {
        try {
          const projectLeads = await getProjectLeadsDirectly(projectId);
          setLeads(projectLeads);
          console.log(`Loaded ${projectLeads.length} leads for project ${projectId}`);
          
          setRetryCount(0);
          return;
        } catch (projectError) {
          console.error(`Error fetching leads for project ${projectId}:`, projectError);
        }
      }
      
      // If no project ID or first attempt failed, try to get all projects and fetch leads from each
      const availableProjects = projects.length > 0 ? projects : await getUserProjects();
      
      if (availableProjects.length === 0) {
        setLeads([]);
        throw new Error('Keine Projekte für Ihr Konto gefunden');
      }
      
      let allLeads: Lead[] = [];
      let anyProjectSucceeded = false;
      
      for (const project of availableProjects) {
        try {
          const projectLeads = await getProjectLeadsDirectly(project.id);
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
        throw new Error('Konnte keine Leads aus irgendeinem Projekt laden');
      }
      
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching leads:', err);
      
      const formattedError = err instanceof Error 
        ? err 
        : new Error(typeof err === 'string' ? err : 'Unbekannter Fehler beim Abrufen von Leads');
      
      setError(formattedError);
      
      // Only increment retry count on initial load, not manual retries
      if (!initialLoadAttemptedRef.current) {
        setRetryCount(prev => prev + 1);
        initialLoadAttemptedRef.current = true;
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [projectFilter, projects, projectsLoading, fetchProjects, isRetrying]);
  
  // Filter leads when data changes
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
  
  // Initial data load - only once
  useEffect(() => {
    if (!initialLoadAttemptedRef.current && !isLoading && !isRetrying) {
      console.log('Performing initial lead data load...');
      fetchLeads();
      initialLoadAttemptedRef.current = true;
    }
  }, [fetchLeads, isLoading, isRetrying]);
  
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    if (!isInProjectContext) {
      setProjectFilter('all');
    }
    
    toast({
      title: "Filter zurückgesetzt",
      description: "Alle Filter wurden zurückgesetzt."
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
          projects.find(p => p.id === (newLead.project_id || projectFilter))?.name || 'Unbekannt' : 
          'Nicht zugewiesen',
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
        title: "Lead erstellt",
        description: "Neuer Lead wurde erfolgreich erstellt."
      });
      
      return processedLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Erstellen des Leads';
      
      toast({
        title: "Fehler",
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
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Leads';
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleRetryFetch = () => {
    // Prevent multiple clicks
    if (isRetrying) return;
    
    setIsRetrying(true);
    fetchLeads();
  };
  
  // Show fallback component if still loading after multiple retries
  if (isLoading && retryCount > 2) {
    return <LeadDatabaseFallback message="Versuche weiterhin, Ihre Leads zu laden..." />;
  }
  
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
            disabled={isLoading || isRetrying}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading || isRetrying ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>
      </div>
      
      {userEmail && (
        <div className="px-4 py-3 mt-4 rounded-md bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Benutzer:</span> {userEmail}
            {isInProjectContext && (
              <span className="ml-2">
                <span className="font-semibold">Projekt:</span> {urlProjectId || 'unbekannt'}
              </span>
            )}
          </p>
        </div>
      )}
      
      {error && !isLoading && (
        <LeadErrorHandler 
          error={error}
          retryCount={retryCount}
          onRetry={handleRetryFetch}
          isRetrying={isRetrying}
        />
      )}
      
      {projectsError && !error && (
        <LeadErrorHandler
          error={new Error(`Fehler beim Laden von Projekten: ${projectsError}`)} 
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
        fetchError={error || (projectsError ? new Error(projectsError) : null)}
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
          // Don't call fetchLeads - just wait for the user to refresh manually
          toast({
            title: "Leads importiert",
            description: "Klicken Sie auf 'Aktualisieren', um Ihre neuen Leads zu sehen."
          });
        }}
        projectId={projectFilter !== 'all' ? projectFilter : undefined}
      />
    </LeadDatabaseContainer>
  );
};

export default LeadDatabase;
