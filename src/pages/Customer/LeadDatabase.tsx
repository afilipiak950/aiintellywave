
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLeads } from '@/hooks/use-leads';
import { supabase } from '@/integrations/supabase/client';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import { UserPlus, Database, Bug, List, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { AnimatedBackground } from '@/components/leads/AnimatedBackground';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/lead';
import { useAuth } from '@/context/auth';

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
        status: 'new' as LeadStatus, // Explicit type cast to LeadStatus
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
      
      // Test RLS policies
      const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_policies');
      
      debugData.rls = {
        success: !rlsError,
        data: rlsData,
        error: rlsError?.message
      };
      
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
    <div className="relative">
      {/* Enhanced background effects - now with all three animated components */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <AnimatedAgents />
        <FloatingElements />
        <AnimatedBackground />
      </div>
      
      <div className="relative z-10 container mx-auto py-6 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Lead Database
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all leads across your projects
            </p>
          </motion.div>
          
          <div className="flex flex-wrap space-x-2 gap-y-2">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-indigo-600 to-violet-600"
              onClick={() => setCreateDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Lead
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={testDirectLeadCreation}
              className="bg-white/50"
            >
              <Database className="mr-2 h-4 w-4" />
              Debug: Create Test Lead
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={debugDatabaseAccess}
              className="bg-white/50"
            >
              <Bug className="mr-2 h-4 w-4" />
              Debug DB Access
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={forceRefreshLeads}
              className="bg-white/50 text-slate-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Leads
            </Button>
          </div>
        </div>
        
        {/* Debug Information Panel */}
        {debugInfo && (
          <div className="bg-white/80 rounded-lg p-4 border shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Debug Information</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDebugInfo(null)}
              >
                Close
              </Button>
            </div>
            
            {debugInfo.status === 'loading' ? (
              <p>Loading debug information...</p>
            ) : debugInfo.status === 'error' ? (
              <p className="text-red-500">Error: {debugInfo.error}</p>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold">Authentication</h4>
                  <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(debugInfo.auth, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold">Projects ({debugInfo.projects?.count || 0})</h4>
                  <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(debugInfo.projects, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold">Leads ({debugInfo.leads?.count || 0})</h4>
                  <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(debugInfo.leads, null, 2)}
                  </pre>
                </div>
                
                {debugInfo.rls && (
                  <div>
                    <h4 className="font-semibold">RLS Policies</h4>
                    <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(debugInfo.rls, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
};

export default LeadDatabase;
