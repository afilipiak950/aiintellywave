
import React, { useState, useEffect } from 'react';
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
    refetch
  } = usePipeline();

  const [companies, setCompanies] = useState<{ id: string, name: string }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  // Extract unique companies from projects
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

  // Auto-retry on RLS errors but with a limit
  useEffect(() => {
    if (error && error.includes('Database access issue') && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto retry attempt ${retryCount + 1}`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, 2000 * (retryCount + 1)); // Increasing backoff
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => {
          setRetryCount(0);
          refetch();
          toast({
            title: "Refreshing",
            description: "Updating project data..."
          });
        }}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
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
