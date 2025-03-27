
import React from 'react';
import { motion } from 'framer-motion';
import { PipelineStage, PipelineProject } from '../../types/pipeline';
import PipelineProjectCard from './PipelineProjectCard';

interface PipelineColumnProps {
  stage: PipelineStage;
  projects: PipelineProject[];
  onDragStart: (project: PipelineProject) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  draggedProject: PipelineProject | null;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  projects,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedProject
}) => {
  const isOver = draggedProject !== null;
  
  return (
    <div 
      className="flex flex-col min-h-[500px] w-full"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
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
        className={`flex-1 p-2 rounded-b-lg bg-card border border-t-0 border-border transition-colors duration-200 overflow-y-auto ${
          isOver ? 'bg-muted' : ''
        }`}
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
                onDragStart={() => onDragStart(project)}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PipelineColumn;
