
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { LucideIcon } from "lucide-react";
import { ProjectDetails } from '../../../hooks/use-project-detail';

interface CompanyUser {
  user_id: string;
  email: string;
  full_name?: string;
}

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
    assigned_to: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  statusColors: Record<string, string>;
  StatusIcon: LucideIcon;
  availableUsers: CompanyUser[];
}

const ProjectInfoCard = ({ 
  project, 
  isEditing, 
  formData, 
  handleInputChange,
  statusColors,
  StatusIcon,
  availableUsers = []
}: ProjectInfoCardProps) => {
  // Helper to format dates for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString();
  };
  
  // Display name for assigned user
  const getAssignedUserName = () => {
    if (!project.assigned_to) return 'Unassigned';
    const assignedUser = availableUsers.find(user => user.user_id === project.assigned_to);
    return assignedUser ? (assignedUser.full_name || assignedUser.email) : 'Unknown User';
  };
  
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Status</h3>
          {isEditing ? (
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          ) : (
            <div className="flex items-center">
              <StatusIcon className="h-4 w-4 mr-2 text-gray-600" />
              <Badge className={`${statusColors[project.status] || 'bg-gray-100'}`}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          )}
          
          <h3 className="font-medium text-gray-700 mt-4 mb-2">Company</h3>
          <p>{project.company_name}</p>
          
          <h3 className="font-medium text-gray-700 mt-4 mb-2">Assigned To</h3>
          {isEditing ? (
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">Unassigned</option>
              {availableUsers.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          ) : (
            <p>{getAssignedUserName()}</p>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Timeline</h3>
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p>{formatDate(project.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End Date</p>
                <p>{formatDate(project.end_date)}</p>
              </div>
            </div>
          )}
          
          <h3 className="font-medium text-gray-700 mt-4 mb-2">Budget</h3>
          {isEditing ? (
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              placeholder="Enter budget"
            />
          ) : (
            <p>
              {project.budget ? (
                new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                }).format(project.budget)
              ) : (
                'Not set'
              )}
            </p>
          )}
          
          <div className="mt-4">
            <p className="text-xs text-gray-500">Created</p>
            <p>{new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectInfoCard;
