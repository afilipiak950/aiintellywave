
import { CalendarClock, ChevronRight, Clock, FileText, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

type ProjectStatus = 'completed' | 'in-progress' | 'pending' | 'canceled';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    client: string;
    status: ProjectStatus;
    progress: number;
    startDate: string;
    endDate: string;
  };
  onClick?: () => void;
}

const getStatusConfig = (status: ProjectStatus) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle2,
      };
    case 'in-progress':
      return {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-700',
        icon: Clock,
      };
    case 'pending':
      return {
        label: 'Pending',
        color: 'bg-amber-100 text-amber-700',
        icon: AlertTriangle,
      };
    case 'canceled':
      return {
        label: 'Canceled',
        color: 'bg-red-100 text-red-700',
        icon: XCircle,
      };
  }
};

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const statusConfig = getStatusConfig(project.status);
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg">{project.title}</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusConfig.color}`}>
            <statusConfig.icon size={14} className="mr-1" />
            {statusConfig.label}
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{project.description}</p>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-sm font-medium">{project.progress}%</div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <FileText size={14} className="mr-1.5" />
            <span>Client: {project.client}</span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <CalendarClock size={14} className="mr-1.5" />
            <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 border-t border-gray-100">
        <button className="text-blue-600 text-sm font-medium flex items-center w-full justify-center hover:underline">
          View Details
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
