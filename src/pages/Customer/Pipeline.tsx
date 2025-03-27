import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { usePipeline } from '../../hooks/use-pipeline';
import PipelineBoard from '../../components/pipeline/PipelineBoard';
import PipelineEmptyState from '../../components/pipeline/PipelineEmptyState';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { AnimatedBackground } from '@/components/appointments/AnimatedBackground';
import { useAuth } from '../../context/auth';

const CustomerPipeline = () => {
  const { user } = useAuth();
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

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Animated background with particles */}
      <div className="opacity-50">
        <AnimatedBackground />
      </div>
      
      {/* Add floating elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <FloatingElements />
      </div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="bg-primary/10 p-2 rounded-full">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
        </motion.div>
        
        <motion.p 
          className="text-muted-foreground max-w-3xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Track your projects through different stages. Drag and drop to update project progress.
        </motion.p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Loading pipeline data...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
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
          />
        )}
      </div>
    </div>
  );
};

export default CustomerPipeline;
