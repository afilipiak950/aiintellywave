
import { AlertCircle } from 'lucide-react';

const ProjectFeedbackEmpty = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No feedback yet</h3>
      <p className="text-gray-500 mt-1">
        Be the first to provide feedback on this project.
      </p>
    </div>
  );
};

export default ProjectFeedbackEmpty;
