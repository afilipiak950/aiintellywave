
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Building, ExternalLink } from 'lucide-react';
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
}

// Use memo to prevent unnecessary re-renders
const PipelineProjectCard = memo(({
  project
}: PipelineProjectCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Enhanced drag handling with visual feedback
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('projectId', project.id);
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    
    // Skip creating drag image for better performance
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    event.dataTransfer.setDragImage(emptyImg, 0, 0);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ 
          opacity: isDragging ? 0.6 : 1,
          transform: isDragging ? 'scale(0.98)' : 'scale(1)'
        }}
      >
        <Card className="overflow-hidden bg-card">
          <CardContent className="p-3">
            <div className="mb-2 flex justify-between items-start">
              <h4 className="font-medium text-sm line-clamp-1">{project.name}</h4>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
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
            
            {project.description && (
              <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {project.description}
              </div>
            )}
            
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Building size={12} className="mr-1" />
              <span className="truncate max-w-[150px]">{project.company}</span>
            </div>
            
            <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

// Add display name for debugging
PipelineProjectCard.displayName = 'PipelineProjectCard';

export default PipelineProjectCard;
