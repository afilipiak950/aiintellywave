
import { Search } from 'lucide-react';

interface ProjectEmptyStateProps {
  searchTerm?: string;
}

const ProjectEmptyState = ({ searchTerm = '' }: ProjectEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
        <Search size={24} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
      <p className="text-gray-500">
        We couldn't find any projects matching your search criteria. Try adjusting your filters or contact your project manager.
      </p>
    </div>
  );
};

export default ProjectEmptyState;
