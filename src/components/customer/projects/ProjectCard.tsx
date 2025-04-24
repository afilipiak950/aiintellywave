
import React from 'react';
import { motion } from 'framer-motion';

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

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.05
      }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planning': return 'bg-amber-100 text-amber-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'canceled': return 'bg-red-100 text-red-700';
      case 'on_hold': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getStatusInGerman = (status: string): string => {
    const statusMap: Record<string, string> = {
      'planning': 'Planung',
      'in_progress': 'In Bearbeitung',
      'review': 'Überprüfung',
      'completed': 'Abgeschlossen',
      'canceled': 'Abgebrochen',
      'on_hold': 'Pausiert'
    };
    
    return statusMap[status] || status;
  };
  
  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-amber-500';
    return 'bg-gray-500';
  };
  
  return (
    <motion.div 
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
      className="border rounded-lg p-5 cursor-pointer bg-gradient-to-br from-white to-gray-50 hover:from-indigo-50 hover:to-white transition-all duration-300"
    >
      <div className="flex justify-between">
        <h4 className="font-medium truncate">{project.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {getStatusInGerman(project.status)}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mt-3 line-clamp-2 min-h-[2.5rem]">
        {project.description || 'Keine Beschreibung'}
      </p>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Fortschritt</span>
          <span className="text-xs font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <motion.div 
            className={`h-1.5 rounded-full ${getProgressColor(project.progress)}`}
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
          />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-bl-full opacity-20 transform translate-x-4 -translate-y-4 pointer-events-none"></div>
    </motion.div>
  );
};
