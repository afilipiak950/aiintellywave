
import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from "../../button";

interface TasksEmptyProps {
  canEdit: boolean;
  onAddClick: () => void;
}

const TasksEmpty: React.FC<TasksEmptyProps> = ({ canEdit, onAddClick }) => {
  return (
    <div className="text-center py-6 bg-gray-50 rounded-md">
      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-500">No tasks yet</p>
      {canEdit && (
        <Button 
          onClick={onAddClick} 
          size="sm"
          variant="outline"
          className="mt-2"
        >
          <Plus size={14} className="mr-1" />
          Add First Task
        </Button>
      )}
    </div>
  );
};

export default TasksEmpty;
