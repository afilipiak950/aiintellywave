
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
}

interface ProjectsGridProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ 
  projects, 
  onProjectClick 
}) => {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ihre Projekte</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="text-xs flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Aktualisieren
          </Button>
        </div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project.id)}
              index={index}
            />
          ))}
        </motion.div>
      </div>
      
      {projects.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          <p>Projekte erfolgreich geladen: {projects.length}</p>
        </div>
      )}
    </motion.div>
  );
};
