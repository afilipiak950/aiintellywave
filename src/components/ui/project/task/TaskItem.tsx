
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from "../../button";
import { Badge } from "../../badge";
import { getStatusColor } from '../../../../utils/task-utils';
import { Task } from '../../../../types/project';

interface TaskItemProps {
  task: Task;
  canEdit: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, canEdit, onEdit, onDelete }) => {
  return (
    <div key={task.id} className="p-3 bg-white rounded-md border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-gray-600 text-xs mt-1">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-x-3 mt-2 text-xs text-gray-500">
            {task.due_date && (
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            )}
            {task.assigned_user_name && (
              <span>Assigned to: {task.assigned_user_name}</span>
            )}
          </div>
        </div>
        
        {canEdit && (
          <div className="flex space-x-1 ml-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onEdit(task)}
            >
              <Edit size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 text-red-600"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
