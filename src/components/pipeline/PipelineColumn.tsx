
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
}: PipelineColumnProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const projectId = e.dataTransfer.getData('projectId');
    
    if (!projectId) {
      console.error('Ungültige Projekt-ID beim Drag & Drop');
      toast({
        title: "Fehler",
        description: "Ungültige Projekt-ID",
        variant: "destructive"
      });
      return;
    }
    
    onDrop(projectId);
  };
  
  return (
    <div 
      className="flex flex-col min-h-[500px] w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${stage.color || 'bg-primary'}`}>
        <h3 className="font-medium text-white text-sm">
          {stage.name}
        </h3>
        <span className="bg-white bg-opacity-30 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {projects?.length || 0}
        </span>
      </div>
      
      <motion.div 
        className={`flex-1 p-2 rounded-b-lg bg-card border border-t-0 transition-colors overflow-y-auto ${
          isDraggingOver ? 'border-primary/50 bg-primary/5' : 'border-border'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {!projects || projects.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[100px] border-2 border-dashed border-muted rounded-md">
            <p className="text-muted-foreground text-sm">Keine Projekte in dieser Phase</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              // Ensure project has valid data
              if (!project || !project.id || !project.name) {
                console.warn('Invalid project data:', project);
                return null;
              }
              
              // Ensure valid status
              const validStatus = isValidProjectStatus(project.status) ? project.status : 'planning';
              
              return (
                <ProjectStageCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  status={validStatus}
                />
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
});

PipelineColumn.displayName = 'PipelineColumn';

export default PipelineColumn;
