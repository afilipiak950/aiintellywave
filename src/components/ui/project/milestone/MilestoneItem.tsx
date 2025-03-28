
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card } from "../../card";
import { Button } from "../../button";
import { Badge } from "../../badge";
import MilestoneProgress from './MilestoneProgress';
import ProjectTasks from '../ProjectTasks';
import { Milestone } from '../../../../types/project';
import { getStatusColor, getStatusIcon } from '../../../../utils/milestone-utils';

interface MilestoneItemProps {
  milestone: Milestone;
  canEdit: boolean;
  isEditing: boolean;
  isExpanded: boolean;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
  onToggleExpand: (milestoneId: string) => void;
  onTasksChange: () => void;
  projectId: string;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ 
  milestone,
  canEdit, 
  isEditing,
  isExpanded,
  onEdit, 
  onDelete,
  onToggleExpand,
  onTasksChange,
  projectId
}) => {
  const StatusIcon = getStatusIcon(milestone.status);
  
  return (
    <Card key={milestone.id} className="overflow-hidden">
      {!isEditing && (
        <>
          <div 
            className="p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
            onClick={() => onToggleExpand(milestone.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{milestone.title}</h3>
                {milestone.description && (
                  <p className="text-gray-500 text-sm mt-1">{milestone.description}</p>
                )}
              </div>
              
              <Badge className={`flex items-center gap-1 ${getStatusColor(milestone.status)}`}>
                <StatusIcon size={14} />
                <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
              </Badge>
            </div>
            
            <MilestoneProgress 
              taskCount={milestone.taskCount} 
              completedTaskCount={milestone.completedTaskCount} 
            />
            
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-gray-500 flex items-center">
                <span>{milestone.taskCount} {milestone.taskCount === 1 ? 'task' : 'tasks'}</span>
                {milestone.due_date && (
                  <span className="ml-4">Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                )}
              </div>
              
              {canEdit && (
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(milestone);
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(milestone.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {isExpanded && (
            <div className="p-4 bg-gray-50">
              <ProjectTasks 
                projectId={projectId} 
                milestoneId={milestone.id} 
                canEdit={canEdit}
                onTasksChange={onTasksChange}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default MilestoneItem;
