
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
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const LeadDatabase = () => {
  const {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  } = useManagerProjects();
  
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the unified leads approach with assignedToUser set to true
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
    duplicatesCount
  } = useLeads({ assignedToUser: true });
  
  // Add state for import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Set up real-time subscription for lead changes
  useEffect(() => {
    console.log('Setting up leads real-time subscription');
    const channel = supabase.channel('public:leads-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads'
      }, () => {
        console.log('Lead data changed, refreshing leads');
        fetchLeads();
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to lead changes');
        }
      });
      
    return () => {
      console.log('Cleaning up lead subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);
  
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
    setRetryCount(prev => prev + 1);
    fetchLeads();
    toast({
      title: "Retrying",
      description: "Fetching leads again..."
    });
  };
  
  // Check if there's an error state (no leads when loading is done)
  const hasError = !leadsLoading && allLeads.length === 0 && retryCount > 0;
  
  return (
    <LeadDatabaseContainer>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <LeadDatabaseHeader />
        
        <LeadDatabaseActions 
          onCreateClick={() => setCreateDialogOpen(true)}
          totalLeadCount={allLeads.length}
          onImportClick={() => setImportDialogOpen(true)}
        />
      </div>
      
      {/* Error Message */}
      {hasError && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Lead Fetch Error</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span>Error fetching leads. This could be due to network issues or permissions.</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-0 sm:ml-4" 
              onClick={handleRetryFetch}
            >
              <RefreshCcw className="mr-1 h-4 w-4" /> Retry
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
        totalLeadCount={allLeads.length}
        filteredCount={leads.length}
        duplicatesCount={duplicatesCount}
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
      
      {/* Import Lead Dialog */}
      <LeadImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onLeadCreated={() => {
          // Force refresh leads after import
          fetchLeads();
        }}
        projectId={projectFilter !== 'all' ? projectFilter : undefined}
      />
    </LeadDatabaseContainer>
  );
};

export default LeadDatabase;
