
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDetail from '../../components/ui/project/ProjectDetail';
import { useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

const CustomerProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!id) {
      console.error('Project ID is missing');
      navigate('/customer/projects');
    }
  }, [id, navigate]);
  
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-red-500 mb-4">Project ID is required</p>
        <button 
          onClick={() => navigate('/customer/projects')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error loading project details</h2>
          <p className="text-gray-700 mb-4">There was an error loading the project details.</p>
          <button 
            onClick={() => navigate('/customer/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      }
    >
      <div className="p-6">
        <ProjectDetail projectId={id} />
      </div>
    </ErrorBoundary>
  );
};

export default CustomerProjectDetail;
