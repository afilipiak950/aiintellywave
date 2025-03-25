
import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from "../button";
import { ProjectDetails } from '../../../hooks/use-project-detail';

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
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectHeader = ({
  project,
  canEdit,
  isEditing,
  setIsEditing,
  handleDelete,
  handleSubmit,
  formData,
  handleInputChange
}: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="text-2xl font-bold border rounded px-2 py-1 w-full"
          />
        ) : (
          <h1 className="text-2xl font-bold">{project.name}</h1>
        )}
        <p className="text-gray-500">For {project.company_name}</p>
      </div>
      
      {canEdit && !isEditing && (
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
          >
            <Edit size={16} className="mr-2" />
            Edit Project
          </Button>
          <Button 
            onClick={handleDelete}
            variant="destructive"
            size="sm"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      )}
      
      {isEditing && (
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            size="sm"
          >
            Save Changes
          </Button>
          <Button 
            onClick={() => setIsEditing(false)}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;
