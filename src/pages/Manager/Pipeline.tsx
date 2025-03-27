
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { usePipeline } from '../../hooks/use-pipeline';
import PipelineBoard from '../../components/pipeline/PipelineBoard';
import PipelineEmptyState from '../../components/pipeline/PipelineEmptyState';
import { toast } from '@/hooks/use-toast';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';

const ManagerPipeline = () => {
  const {
    projects,
    stages,
    loading,
    searchTerm,
    setSearchTerm,
    filterCompanyId,
    setFilterCompanyId,
    updateProjectStage
  } = usePipeline();

  // Extract unique companies from projects
  const [companies, setCompanies] = useState<{ id: string, name: string }[]>([]);
  
  useEffect(() => {
    if (projects.length > 0) {
      const uniqueCompanies = Array.from(
        new Set(projects.map(project => project.company_id))
      ).map(companyId => {
        const project = projects.find(p => p.company_id === companyId);
        return {
          id: companyId,
          name: project?.company || 'Unknown Company'
        };
      });
      setCompanies(uniqueCompanies);
    }
  }, [projects]);

  // Handle stage change with visual feedback
  const handleStageChange = (projectId: string, newStageId: string) => {
    updateProjectStage(projectId, newStageId);
    
    // Add visual feedback when a card is moved
    const projectName = projects.find(p => p.id === projectId)?.name || 'Project';
    const stageName = stages.find(s => s.id === newStageId)?.name || 'new stage';
    
    toast({
      title: "Project Updated",
      description: `${projectName} moved to ${stageName}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {/* Add animated agents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <AnimatedAgents />
      </div>
      
      {/* Add floating elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <FloatingElements />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
          </div>
        </div>
        
        <p className="text-muted-foreground max-w-3xl mb-8">
          Manage your project pipeline and track progress. Drag and drop projects between stages to update their status.
        </p>
      </motion.div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading pipeline data...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <PipelineEmptyState userRole="manager" />
      ) : (
        <PipelineBoard 
          stages={stages}
          projects={projects}
          onStageChange={handleStageChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCompanyId={filterCompanyId}
          onFilterChange={setFilterCompanyId}
          companies={companies}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ManagerPipeline;
