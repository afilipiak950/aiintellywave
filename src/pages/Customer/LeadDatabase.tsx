
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
  
  // Get project ID from URL if available
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const location = useLocation();
  
  // States to handle leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState(urlProjectId || 'all');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInProjectContext, setIsInProjectContext] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Check if we're in a project context
  useEffect(() => {
    // Check if the URL contains /projects/
    const projectMatch = location.pathname.match(/\/projects\/([^\/]+)/);
    setIsInProjectContext(!!projectMatch);
    
    // If we're in a project context, set the project filter
    if (projectMatch && projectMatch[1]) {
      setProjectFilter(projectMatch[1]);
    }
  }, [location.pathname]);
  
  // Get the current user email for debugging
  useEffect(() => {
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    
    getUserEmail();
  }, []);
  
  // Simplified fetch function
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching leads...');
      
      // Determine if we need to filter by project
      const projectId = projectFilter !== 'all' ? projectFilter : undefined;
      
      // Use the direct approach to fetch leads by project
      if (projectId) {
        const projectLeads = await fetchLeadsByProjectDirect(projectId);
        setLeads(projectLeads);
        console.log(`Loaded ${projectLeads.length} leads for project ${projectId}`);
      } else {
        // Get user's company ID
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) throw new Error('No authenticated user');
        
        // Get user's company
        const { data: companyData, error: companyError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', userData.user.id)
          .maybeSingle();
          
        if (companyError) throw companyError;
        
        // Get all projects for this company
        const { data: companyProjects, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .eq('company_id', companyData?.company_id);
          
        if (projectsError) throw projectsError;
        
        // Fetch leads for all projects
        let allLeads: Lead[] = [];
        
        if (companyProjects && companyProjects.length > 0) {
          for (const project of companyProjects) {
            try {
              const projectLeads = await fetchLeadsByProjectDirect(project.id);
              allLeads = [...allLeads, ...projectLeads];
            } catch (err) {
              console.warn(`Could not load leads for project ${project.id}:`, err);
            }
          }
          
          setLeads(allLeads);
          console.log(`Loaded ${allLeads.length} leads across all projects`);
        } else {
          console.log('No projects found for the company');
          setLeads([]);
        }
      }
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Error Loading Leads",
        description: "There was a problem fetching leads. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [projectFilter]);
  
  // Apply filters to leads
  useEffect(() => {
    if (!leads) return;
    
    let result = [...leads];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(lead => 
        lead.name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower) ||
        lead.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    setFilteredLeads(result);
  }, [leads, searchTerm, statusFilter]);
  
  // Initial load
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);
  
  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    if (!isInProjectContext) {
      setProjectFilter('all');
    }
    
    // Clear localStorage
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
  
  // Create lead handler
  const handleCreateLead = async (leadData: any) => {
    try {
      // If we're in a project context, add the project ID
      if (urlProjectId && !leadData.project_id) {
        leadData.project_id = urlProjectId;
      }
      
      // Create lead
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
      
      // Add to leads if it matches current filter
      if (
        (projectFilter === 'all' || projectFilter === newLead.project_id) &&
        (statusFilter === 'all' || statusFilter === newLead.status)
      ) {
        setLeads(prevLeads => [newLead as Lead, ...prevLeads]);
      }
      
      setCreateDialogOpen(false);
      toast({
        title: "Lead Created",
        description: "New lead has been created successfully."
      });
      
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
  
  // Update lead handler
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
      
      // Update in state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === id ? {...lead, ...updatedLead} as Lead : lead
        )
      );
      
      return updatedLead as Lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Retry fetch
  const handleRetryFetch = () => {
    setIsRetrying(true);
    fetchLeads();
  };
  
  return (
    <LeadDatabaseContainer>
      {/* Page Header */}
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
      
      {/* User Email Alert - for debugging */}
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
      
      {/* Error Message with Retry Button */}
      {error && !isLoading && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Lead Fetch Error</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex-1">
              <p>Error fetching leads: {error.message}</p>
              <p className="text-sm mt-1">This could be due to database permissions issues or network problems.</p>
              {retryCount > 0 && <p className="text-sm mt-1">Retry attempts: {retryCount}</p>}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap" 
              onClick={handleRetryFetch}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
              Retry Now
            </Button>
          </AlertDescription>
        </Alert>
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
      
      {/* Create Lead Dialog */}
      <LeadCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateLead={handleCreateLead}
        projects={projects}
        defaultProjectId={urlProjectId} 
      />
      
      {/* Import Lead Dialog */}
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
