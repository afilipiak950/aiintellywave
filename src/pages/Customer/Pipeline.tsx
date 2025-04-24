import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePipeline } from '../../hooks/pipeline/use-pipeline';
import PipelineBoard from '../../components/pipeline/PipelineBoard';
import PipelineEmptyState from '../../components/pipeline/PipelineEmptyState';
import PipelinePageHeader from '../../components/pipeline/PipelinePageHeader';
import PipelineLoading from '../../components/pipeline/PipelineLoading';
import PipelineError from '../../components/pipeline/PipelineError';
import { toast } from '@/hooks/use-toast';

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

  const handleStageChange = useCallback((projectId: string, newStageId: string) => {
    updateProjectStage(projectId, newStageId);
    
    const project = projects.find(p => p.id === projectId);
    const stage = stages.find(s => s.id === newStageId);
    
    if (project && stage) {
      toast({
        title: "Project Updated",
        description: `${project.name} moved to ${stage.name}`,
      });
    }
  }, [projects, stages, updateProjectStage]);
  
  useEffect(() => {
    if (!error) {
      refetch();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <PipelinePageHeader
        isRefreshing={isRefreshing}
        onRefresh={refetch}
        retryCount={retryCount}
        setRetryCount={setRetryCount}
      />
      
      {error && (
        <PipelineError 
          error={error}
          onRetry={() => {
            setRetryCount(0);
            refetch();
          }}
          isRefreshing={isRefreshing}
        />
      )}
      
      {loading ? (
        <PipelineLoading />
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
