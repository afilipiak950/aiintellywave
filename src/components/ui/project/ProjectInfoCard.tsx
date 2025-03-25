
import { Calendar } from 'lucide-react';
import { Badge } from "../badge";
import { Card } from "../card";
import { ProjectDetails } from '../../../hooks/use-project-detail';

interface ProjectInfoCardProps {
  project: ProjectDetails;
  isEditing: boolean;
  formData: {
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    budget: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  statusColors: {
    [key: string]: string;
  };
  StatusIcon: React.ComponentType<{ size: number }>;
}

const ProjectInfoCard = ({
  project,
  isEditing,
  formData,
  handleInputChange,
  statusColors,
  StatusIcon
}: ProjectInfoCardProps) => {
  return (
    <Card className="p-6">
      {isEditing ? (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter budget amount"
              step="0.01"
            />
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <div className="flex items-center mt-1">
                <Badge className={`flex items-center gap-1 ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
                  <StatusIcon size={14} />
                  <span className="capitalize">{project.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-gray-500 text-sm">Budget</p>
              <p className="font-semibold">
                {project.budget ? `$${project.budget.toLocaleString()}` : 'Not specified'}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">Timeline</p>
            <div className="flex items-center mt-1 text-sm">
              <Calendar size={16} className="mr-2 text-gray-500" />
              {project.start_date && project.end_date ? (
                <span>
                  {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                </span>
              ) : project.start_date ? (
                <span>Starts on {new Date(project.start_date).toLocaleDateString()}</span>
              ) : project.end_date ? (
                <span>Due by {new Date(project.end_date).toLocaleDateString()}</span>
              ) : (
                <span className="text-gray-500">No dates specified</span>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">Description</p>
            <p className="mt-1">{project.description || 'No description provided.'}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProjectInfoCard;
