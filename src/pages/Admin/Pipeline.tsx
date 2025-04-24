
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, RefreshCw } from 'lucide-react';
import { usePipeline } from '../../hooks/pipeline/use-pipeline';
import PipelineBoard from '../../components/pipeline/PipelineBoard';
import PipelineEmptyState from '../../components/pipeline/PipelineEmptyState';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";

const AdminPipeline = () => {
  const {
    projects,
    stages,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterCompanyId,
    setFilterCompanyId,
    updateProjectStage,
    refetch
  } = usePipeline();

  // Extract unique companies from projects
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  
  useEffect(() => {
    if (projects.length > 0) {
      const uniqueCompanies = Array.from(
        new Set(projects.map(project => project.company_id))
      ).map(companyId => {
        const project = projects.find(p => p.company_id === companyId);
        return {
          id: companyId as string,
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
  
  // Force refetch on mount to ensure we get the latest data
  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
        
        <p className="text-muted-foreground max-w-3xl mb-8">
          Get a comprehensive view of all projects across your organization. Manage pipeline stages and track progress across teams.
        </p>
      </motion.div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading pipeline data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Pipeline</h3>
          <p className="text-muted-foreground mb-4 text-center">{error}</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <PipelineEmptyState userRole="admin" />
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
          error={error}
        />
      )}
    </div>
  );
};

export default AdminPipeline;
