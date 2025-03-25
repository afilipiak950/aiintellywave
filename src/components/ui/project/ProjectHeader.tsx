
import { ArrowLeft, FolderPlus, Edit, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { ProjectDetails } from '../../../hooks/use-project-detail';

// Project list view header props
interface ProjectListHeaderProps {
  onCreateClick: () => void;
}

// Project detail view header props
interface ProjectDetailHeaderProps {
  project: ProjectDetails;
  canEdit: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  formData: {
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    budget: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

// Merged type to support both use cases
export type ProjectHeaderProps = ProjectListHeaderProps | ProjectDetailHeaderProps;

const ProjectHeader = (props: ProjectHeaderProps) => {
  const navigate = useNavigate();

  // Check if this is a detail view (has project property)
  const isDetailView = 'project' in props;
  
  if (isDetailView) {
    const { project, canEdit, isEditing, setIsEditing, handleDelete, handleSubmit } = props;
    
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft size={18} />
            </Button>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={props.formData.name}
                onChange={props.handleInputChange}
                className="text-2xl font-bold bg-gray-50 border border-gray-300 p-2 rounded"
              />
            ) : (
              <h1 className="text-2xl font-bold">{project.name}</h1>
            )}
          </div>
          
          <div className="flex space-x-2">
            {canEdit && !isEditing && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </>
            )}
            
            {isEditing && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  size="sm"
                  onClick={handleSubmit}
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // List view header (original behavior)
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
      <h1 className="text-2xl font-bold">Projects</h1>
      <button 
        onClick={props.onCreateClick}
        className="btn-primary inline-flex sm:self-end"
      >
        <FolderPlus size={18} className="mr-2" />
        Add Project
      </button>
    </div>
  );
};

export default ProjectHeader;
