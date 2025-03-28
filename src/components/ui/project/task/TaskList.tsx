
import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '../../../../types/project';

interface TaskListProps {
  tasks: Task[];
  canEdit: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, canEdit, onEdit, onDelete }) => {
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          canEdit={canEdit} 
          onEdit={onEdit} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
