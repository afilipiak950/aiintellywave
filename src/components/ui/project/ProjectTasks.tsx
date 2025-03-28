
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "../button";
import { useProjectTasks } from '../../../hooks/use-project-tasks';
import TaskForm from './task/TaskForm';
import TaskList from './task/TaskList';
import TasksEmpty from './task/TasksEmpty';

interface ProjectTasksProps {
  projectId: string;
  milestoneId: string;
  canEdit: boolean;
  onTasksChange?: () => void;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ 
  projectId, 
  milestoneId, 
  canEdit, 
  onTasksChange 
}) => {
  const {
    tasks,
    loading,
    isAddingTask,
    editingTaskId,
    formData,
    availableUsers,
    setIsAddingTask,
    handleInputChange,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    startEditTask,
    cancelForm
  } = useProjectTasks({ projectId, milestoneId });
  
  const handleTaskSubmit = async (e: React.FormEvent) => {
    let success;
    
    if (editingTaskId) {
      success = await handleUpdateTask(editingTaskId, e);
    } else {
      success = await handleAddTask(e);
    }
    
    // Notify parent of change
    if (success && onTasksChange) {
      onTasksChange();
    }
  };
  
  const handleTaskDelete = async (taskId: string) => {
    const success = await handleDeleteTask(taskId);
    
    // Notify parent of change
    if (success && onTasksChange) {
      onTasksChange();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Tasks</h3>
        {canEdit && (
          <Button 
            onClick={() => setIsAddingTask(true)}
            disabled={isAddingTask}
            size="sm"
            variant="outline"
          >
            <Plus size={14} className="mr-1" />
            Add Task
          </Button>
        )}
      </div>
      
      {(isAddingTask || editingTaskId) && (
        <TaskForm 
          formData={formData}
          availableUsers={availableUsers}
          isEditing={!!editingTaskId}
          onInputChange={handleInputChange}
          onSubmit={handleTaskSubmit}
          onCancel={cancelForm}
        />
      )}
      
      {tasks.length === 0 && !isAddingTask ? (
        <TasksEmpty canEdit={canEdit} onAddClick={() => setIsAddingTask(true)} />
      ) : (
        <TaskList 
          tasks={tasks} 
          canEdit={canEdit} 
          onEdit={startEditTask} 
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
};

export default ProjectTasks;
