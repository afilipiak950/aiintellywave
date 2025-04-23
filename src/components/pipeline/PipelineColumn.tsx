
import React from 'react';
import { motion } from 'framer-motion';
import { PipelineStage, PipelineProject } from '../../types/pipeline';
import PipelineProjectCard from './PipelineProjectCard';

interface PipelineColumnProps {
  stage: PipelineStage;
  projects: PipelineProject[];
  onDrop: (projectId: string) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  projects,
  onDrop
}) => {
  // Simplified drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    if (projectId) {
      onDrop(projectId);
    }
  };
  
  return (
    <div 
      className="flex flex-col min-h-[500px] w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${stage.color || 'bg-primary'}`}>
        <h3 className="font-medium text-white text-sm">
          {stage.name}
        </h3>
        <span className="bg-white bg-opacity-30 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {projects.length}
        </span>
      </div>
      
      <motion.div 
        className="flex-1 p-2 rounded-b-lg bg-card border border-t-0 border-border transition-colors overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[100px] border-2 border-dashed border-muted rounded-md">
            <p className="text-muted-foreground text-sm">Drop projects here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <PipelineProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PipelineColumn;
