
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "../button";
import { useProjectMilestones } from '../../../hooks/use-project-milestones';
import MilestoneForm from './milestone/MilestoneForm';
import MilestoneItem from './milestone/MilestoneItem';
import MilestonesEmpty from './milestone/MilestonesEmpty';

interface ProjectMilestonesProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({ 
  projectId, 
  canEdit 
}) => {
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  
  const {
    milestones,
    loading,
    isAddingMilestone,
    editingMilestoneId,
    formData,
    setIsAddingMilestone,
    handleInputChange,
    handleAddMilestone,
    handleUpdateMilestone,
    handleDeleteMilestone,
    startEditMilestone,
    cancelForm,
    fetchMilestones
  } = useProjectMilestones({ projectId });
  
  const handleMilestoneSubmit = (e: React.FormEvent) => {
    if (editingMilestoneId) {
      handleUpdateMilestone(editingMilestoneId, e);
    } else {
      handleAddMilestone(e);
    }
  };

  const toggleExpandMilestone = (milestoneId: string) => {
    setExpandedMilestoneId(expandedMilestoneId === milestoneId ? null : milestoneId);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Milestones</h2>
        {canEdit && (
          <Button 
            onClick={() => setIsAddingMilestone(true)}
            disabled={isAddingMilestone}
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            Add Milestone
          </Button>
        )}
      </div>
      
      {isAddingMilestone && (
        <MilestoneForm 
          formData={formData}
          isEditing={false}
          onInputChange={handleInputChange}
          onSubmit={handleMilestoneSubmit}
          onCancel={cancelForm}
        />
      )}
      
      {editingMilestoneId && (
        <MilestoneForm 
          formData={formData}
          isEditing={true}
          onInputChange={handleInputChange}
          onSubmit={handleMilestoneSubmit}
          onCancel={cancelForm}
        />
      )}
      
      {milestones.length === 0 && !isAddingMilestone ? (
        <MilestonesEmpty canEdit={canEdit} onAddClick={() => setIsAddingMilestone(true)} />
      ) : (
        <div className="space-y-4">
          {milestones.map(milestone => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              canEdit={canEdit}
              isEditing={editingMilestoneId === milestone.id}
              isExpanded={expandedMilestoneId === milestone.id}
              onEdit={startEditMilestone}
              onDelete={handleDeleteMilestone}
              onToggleExpand={toggleExpandMilestone}
              onTasksChange={fetchMilestones}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;
