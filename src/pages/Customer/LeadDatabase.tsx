
import { useLeads } from '@/hooks/leads/use-leads';
import { useManagerProjects } from '@/hooks/leads/use-manager-projects';

// Imported components
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseActions from '@/components/customer/LeadDatabaseActions';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import LeadImportDialog from '@/components/leads/import/LeadImportDialog';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDatabaseDebug } from '@/hooks/leads/debug/use-database-debug';
import LeadDatabaseDebug from '@/components/customer/LeadDatabaseDebug';
import { supabase } from '@/integrations/supabase/client';

const LeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  } = useManagerProjects();
  
  // Add debug functionality
  const { debugDatabaseAccess, debugInfo, loading: debugLoading } = useDatabaseDebug();
  
  // Use the unified leads approach with assignedToUser set to true
  // Add a limit and disable auto-refresh for initial load
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
    fetchLeads,
    duplicatesCount,
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
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
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
  
  const handleRunDatabaseDebug = async () => {
    await debugDatabaseAccess();
    setShowDebugInfo(true);
    toast({
      title: "Database Debug",
      description: "Debug information has been collected"
    });
  };
  
  // Show error state when there's an error fetching leads
  const hasError = !!fetchError && !isRetrying;
  
  return (
    <LeadDatabaseContainer>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <LeadDatabaseHeader />
        
        <div className="flex items-center gap-2">
          <LeadDatabaseActions 
            onCreateClick={() => setCreateDialogOpen(true)}
            totalLeadCount={allLeads.length}
            onImportClick={() => setImportDialogOpen(true)}
          />
          <Button
            variant="outline" 
            size="sm"
            onClick={handleRunDatabaseDebug}
            disabled={debugLoading}
            className="text-xs"
          >
            {debugLoading ? (
              <RefreshCcw className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Database className="mr-1 h-3 w-3" />
            )}
            Debug
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
            You are currently logged in as: <span className="font-mono">{userEmail}</span>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Message with Retry Button */}
      {hasError && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Lead Fetch Error</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex-1">
              <p>Error fetching leads: {fetchError.message}</p>
              <p className="text-sm mt-1">This could be due to database permissions issues or network problems.</p>
              {retryCount > 0 && <p className="text-sm mt-1">Retry attempts: {retryCount}</p>}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap" 
                onClick={handleRetryFetch}
                disabled={isRetrying}
              >
                <RefreshCcw className={`mr-1 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} /> 
                {isRetrying ? 'Retrying...' : 'Retry Now'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunDatabaseDebug}
                disabled={debugLoading}
              >
                <Database className="mr-1 h-4 w-4" />
                Diagnose
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Debug Info */}
      {showDebugInfo && debugInfo && (
        <LeadDatabaseDebug 
          debugInfo={debugInfo}
          onClose={() => setShowDebugInfo(false)}
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

export default LeadDatabase;
