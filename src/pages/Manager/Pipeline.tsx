
import React, { useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, RefreshCw } from 'lucide-react';
import { usePipeline } from '../../hooks/pipeline/use-pipeline';
import PipelineBoard from '../../components/pipeline/PipelineBoard';
import PipelineEmptyState from '../../components/pipeline/PipelineEmptyState';
import { toast } from '@/hooks/use-toast';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { Button } from "@/components/ui/button";

const ManagerPipeline = () => {
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
    refetch,
    isRefreshing
  } = usePipeline();

  // Extract unique companies from projects - memoized for performance
  const companies = useMemo(() => {
    if (projects.length === 0) return [];
    
    const uniqueCompanies = Array.from(
      new Set(projects.map(project => project.company_id))
    ).map(companyId => {
      const project = projects.find(p => p.company_id === companyId);
      return {
        id: companyId as string,
        name: project?.company || 'Unknown Company'
      };
    });
    
    return uniqueCompanies;
  }, [projects]);

  // Handle stage change with visual feedback - memoized for better performance
  const handleStageChange = useCallback((projectId: string, newStageId: string) => {
    updateProjectStage(projectId, newStageId);
    
    // Find project and stage names for the toast
    const project = projects.find(p => p.id === projectId);
    const stage = stages.find(s => s.id === newStageId);
    
    if (project && stage) {
      toast({
        title: "Project Updated",
        description: `${project.name} moved to ${stage.name}`,
      });
    }
  }, [projects, stages, updateProjectStage]);
  
  // Force refetch on mount to ensure we get the latest data
  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {/* Background effects - use reduced motion settings */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <AnimatedAgents />
        {/* Remove props that cause TypeScript errors */}
        <FloatingElements />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} // Reduced animation time
        className="relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <p className="text-muted-foreground max-w-3xl mb-8">
          Manage your project pipeline and track progress. Drag and drop projects between stages to update their status.
        </p>
      </motion.div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64 relative z-10">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading pipeline data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg p-6 relative z-10">
          <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Pipeline</h3>
          <p className="text-muted-foreground mb-4 text-center">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isRefreshing}
          >
            Try Again
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="relative z-10">
          <PipelineEmptyState userRole="manager" />
        </div>
      ) : (
        <div className="relative z-10">
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
        </div>
      )}
    </div>
  );
};

export default ManagerPipeline;
