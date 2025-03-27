
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, ArrowRight, ExternalLink } from 'lucide-react';
import { PipelineProject } from '../../types/pipeline';
import { NavLink } from 'react-router-dom';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface PipelineProjectCardProps {
  project: PipelineProject;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const PipelineProjectCard: React.FC<PipelineProjectCardProps> = ({
  project,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Determine card background based on progress
  const getProgressGradient = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/20';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-500/10 to-blue-500/20';
    if (progress >= 10) return 'bg-gradient-to-r from-amber-500/10 to-amber-500/20';
    return 'bg-gradient-to-r from-gray-500/10 to-gray-500/20';
  };

  // Use a ref to store the project ID for the dataTransfer
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', project.id);
    setIsDragging(true);
    onDragStart();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd();
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isDragging ? 1.05 : 1,
          boxShadow: isDragging ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className={`relative overflow-hidden ${getProgressGradient(project.progress)}`}>
          {project.hasUpdates && (
            <motion.div 
              className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary m-2"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
          
          <CardContent className="p-3">
            <div className="mb-2 flex justify-between items-start">
              <h4 className="font-medium text-sm line-clamp-1">{project.name}</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink 
                      to={`/customer/projects/${project.id}`} 
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink size={14} />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View project details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {project.description || 'No description provided'}
            </div>
            
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Building size={12} className="mr-1" />
              <span className="truncate max-w-[150px]">{project.company}</span>
            </div>
            
            <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PipelineProjectCard;
