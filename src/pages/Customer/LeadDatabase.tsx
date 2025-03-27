
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLeads } from '@/hooks/use-leads';
import { supabase } from '@/integrations/supabase/client';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadGrid from '@/components/leads/LeadGrid';
import AnimatedBackground from '@/components/leads/AnimatedBackground';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';

interface Project {
  id: string;
  name: string;
}

const LeadDatabase = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
  const {
    leads,
    loading: leadsLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    updateLead
  } = useLeads();
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, company_id')
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setProjects(data.map(project => ({
            id: project.id,
            name: project.name
          })));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  return (
    <>
      <AnimatedBackground />
      
      {/* Add animated agents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <AnimatedAgents />
      </div>
      
      {/* Add floating elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <FloatingElements />
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
          
          <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-violet-600">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Lead
          </Button>
        </div>
        
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
      </div>
    </>
  );
};

export default LeadDatabase;
