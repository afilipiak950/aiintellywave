
import { MoreVertical } from 'lucide-react';
import { Button } from "../../ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { ProjectDetails } from '../../../hooks/use-project-detail';

interface CompanyUser {
  user_id: string;
  email: string;
  full_name?: string;
}

interface ProjectHeaderProps {
  project: ProjectDetails;
  canEdit: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleDelete: () => void;
  handleSubmit: (e: React.FormEvent) => void;
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
  availableUsers: CompanyUser[];
}

const ProjectHeader = ({ 
  project, 
  canEdit, 
  isEditing, 
  setIsEditing, 
  handleDelete,
  handleSubmit,
  formData,
  handleInputChange,
  availableUsers
}: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b">
      <div className="flex-1">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="text-2xl font-bold border-b border-gray-300 pb-1 w-full focus:outline-none"
                required
              />
            </div>
            <div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2 text-gray-600"
                rows={3}
                placeholder="Project description"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description || 'No description provided.'}</p>
          </>
        )}
      </div>
      
      {canEdit && !isEditing && (
        <div className="mt-2 sm:mt-0 self-end sm:self-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;
