
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { PipelineStage } from '../../types/pipeline';
import ProjectStageCard from './ProjectStageCard';
import { isValidProjectStatus } from '@/utils/project-validations';
import { toast } from "@/hooks/use-toast";

interface PipelineColumnProps {
  stage: PipelineStage;
  projects: any[];
  onDrop: (projectId: string) => void;
}

const PipelineColumn = memo(({
  stage,
  projects,
  onDrop
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const projectId = e.dataTransfer.getData('projectId');
    
    if (!isValidProjectStatus(stage.id)) {
      toast({
        title: "Ungültiger Status",
        description: "Projekt kann nicht in diesen Status verschoben werden",
        variant: "destructive"
      });
      return;
    }
    
    if (projectId) onDrop(projectId);
  };
  
  return (
    <div 
      className="flex flex-col min-h-[400px] w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-3 py-2 rounded-t-lg bg-primary/10">
        <h3 className="font-medium text-sm">
          {stage.name}
        </h3>
        <span className="bg-primary/5 px-2 py-0.5 rounded-full text-xs font-medium">
          {projects.length}
        </span>
      </div>
      
      <motion.div 
        className={`flex-1 p-2 space-y-2 rounded-b-lg bg-card border border-t-0 transition-colors ${
          isDraggingOver ? 'border-primary/50 bg-primary/5' : 'border-border'
        }`}
      >
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Keine Projekte
          </div>
        ) : (
          projects.map((project) => (
            isValidProjectStatus(project.status) && (
              <ProjectStageCard
                key={project.id}
                id={project.id}
                name={project.name}
                status={project.status}
              />
            )
          ))
        )}
      </motion.div>
    </div>
  );
});

PipelineColumn.displayName = 'PipelineColumn';

export default PipelineColumn;
