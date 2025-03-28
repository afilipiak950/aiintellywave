
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLeads } from '@/hooks/leads/use-leads';
import { supabase } from '@/integrations/supabase/client';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { AnimatedBackground } from '@/components/leads/AnimatedBackground';
import LeadCreateDialog from '@/components/leads/LeadCreateDialog';
import { useLeadDebug } from '@/hooks/leads/use-debug';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
}

const ManagerLeadDatabase = () => {
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
    createLead,
    updateLead,
    fetchLeads
  } = useLeads();
  
  console.log('ManagerLeadDatabase rendered with', leads.length, 'leads', { leadsLoading });
  
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
    console.log('Creating lead in ManagerLeadDatabase component', leadData);
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
          
          <div className="flex gap-2">
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
              onClick={createTestLead}
              className="bg-white/50"
            >
              Debug: Create Test Lead
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={debugDatabaseAccess}
              className="bg-white/50"
            >
              Debug DB Access
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={forceRefreshLeads}
              className="bg-white/50 text-slate-700"
            >
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
            
            <pre className="bg-slate-100 p-2 rounded overflow-x-auto text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
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

export default ManagerLeadDatabase;
