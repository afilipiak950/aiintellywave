
import React from 'react';
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

const PipelineProjectCard: React.FC<PipelineProjectCardProps> = ({
  project
}) => {
  // Simplified drag handling
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('projectId', project.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="overflow-hidden bg-card">
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
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PipelineProjectCard;
