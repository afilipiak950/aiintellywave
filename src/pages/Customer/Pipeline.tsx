
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, RefreshCw, AlertCircle } from 'lucide-react';
import { usePipeline } from '../../hooks/use-pipeline';
import PipelineBoard from '../../components/pipeline/PipelineBoard';
import PipelineEmptyState from '../../components/pipeline/PipelineEmptyState';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CustomerPipeline = () => {
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

  const [companies, setCompanies] = useState<{ id: string, name: string }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  // Extract unique companies from projects - memoize calculation to avoid recalculating on every render
  const uniqueCompanies = useMemo(() => {
    if (projects.length === 0) return [];
    
    const companyMap = new Map<string, { id: string, name: string }>();
    
    projects.forEach(project => {
      if (project.company_id && !companyMap.has(project.company_id)) {
        companyMap.set(project.company_id, {
          id: project.company_id,
          name: project.company || 'Unknown Company'
        });
      }
    });
    
    return Array.from(companyMap.values());
  }, [projects]);

  useEffect(() => {
    setCompanies(uniqueCompanies);
  }, [uniqueCompanies]);

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
  
  // Only fetch data once on mount - removed the refetch call from the dependency array
  useEffect(() => {
    // Don't auto-refetch if there was an error to prevent infinite error loops
    if (!error) {
      refetch();
    }
  }, []); // Empty dependency array - only runs once

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setRetryCount(0);
            refetch();
            toast({
              title: "Refreshing",
              description: "Updating project data..."
            });
          }}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <p className="text-muted-foreground max-w-3xl mb-8">
        Track your projects through different stages. Drag and drop to update project progress.
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit" 
              onClick={() => {
                setRetryCount(0);
                refetch();
              }}
              disabled={isRefreshing}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading pipeline data...</p>
          </div>
        </div>
      ) : error ? null : projects.length === 0 ? (
        <PipelineEmptyState userRole="customer" />
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

export default CustomerPipeline;
