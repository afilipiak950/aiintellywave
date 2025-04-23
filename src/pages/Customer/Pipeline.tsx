
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, RefreshCw } from 'lucide-react';
import { usePipeline } from '../../hooks/use-pipeline';
import PipelineBoard from '../../components/pipeline/PipelineBoard';
import PipelineEmptyState from '../../components/pipeline/PipelineEmptyState';
import { Button } from "@/components/ui/button";

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
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
        Track your projects through different stages. Drag and drop to update project progress.
      </p>
      
      {projects.length === 0 && !loading ? (
        <PipelineEmptyState userRole="customer" />
      ) : (
        <PipelineBoard 
          stages={stages}
          projects={projects}
          onStageChange={updateProjectStage}
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
