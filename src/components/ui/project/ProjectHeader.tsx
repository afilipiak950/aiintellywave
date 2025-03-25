
import { FolderPlus } from 'lucide-react';

interface ProjectHeaderProps {
  onCreateClick: () => void;
}

const ProjectHeader = ({ onCreateClick }: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
      <h1 className="text-2xl font-bold">Projects</h1>
      <button 
        onClick={onCreateClick}
        className="btn-primary inline-flex sm:self-end"
      >
        <FolderPlus size={18} className="mr-2" />
        Add Project
      </button>
    </div>
  );
};

export default ProjectHeader;
