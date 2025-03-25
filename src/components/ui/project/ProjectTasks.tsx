
import { useState, useEffect } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Task, ProjectTaskRow } from '../../../types/project';
import { useAuth } from '../../../context/AuthContext';

interface ProjectTasksProps {
  projectId: string;
  milestoneId: string;
  canEdit: boolean;
  onTasksChange?: () => void;
}

const statusColors = {
  'pending': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'completed': 'bg-green-100 text-green-700',
};

const ProjectTasks = ({ projectId, milestoneId, canEdit, onTasksChange }: ProjectTasksProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    due_date: '',
    assigned_to: '',
  });
  
  useEffect(() => {
    fetchTasks();
    if (canEdit) {
      fetchUsers();
    }
  }, [projectId, milestoneId]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Use raw query with type casting
      const { data, error } = await (supabase as any)
        .from('project_tasks')
        .select(`
          *,
          assigned_user:assigned_to(
            first_name,
            last_name
          )
        `)
        .eq('project_id', projectId)
        .eq('milestone_id', milestoneId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        // Convert to our Task type
        const formattedTasks: Task[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          due_date: item.due_date,
          assigned_to: item.assigned_to,
          assigned_user_name: item.assigned_user ? 
            `${item.assigned_user.first_name || ''} ${item.assigned_user.last_name || ''}`.trim() || 'Unnamed User' : 
            null,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      // Fetch all users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
        
      if (error) throw error;
      
      if (data) {
        const users = data.map(user => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${user.id.slice(0, 4)}`
        }));
        
        setAvailableUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Non-critical error, don't show toast
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTask = {
        project_id: projectId,
        milestone_id: milestoneId,
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await (supabase as any)
        .from('project_tasks')
        .insert(newTask)
        .select(`
          *,
          assigned_user:assigned_to(
            first_name,
            last_name
          )
        `)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Add the new task to our state
        const newTaskItem: Task = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          due_date: data.due_date,
          assigned_to: data.assigned_to,
          assigned_user_name: data.assigned_user ? 
            `${data.assigned_user.first_name || ''} ${data.assigned_user.last_name || ''}`.trim() || 'Unnamed User' : 
            null,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setTasks([...tasks, newTaskItem]);
        
        resetForm();
        setIsAddingTask(false);
        
        // Notify parent of change
        if (onTasksChange) {
          onTasksChange();
        }
        
        toast({
          title: "Success",
          description: "Task added successfully.",
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateTask = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await (supabase as any)
        .from('project_tasks')
        .update(updateData)
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          // Find assigned user name if assigned_to changed
          let assignedUserName = null;
          if (updateData.assigned_to) {
            const assignedUser = availableUsers.find(user => user.id === updateData.assigned_to);
            if (assignedUser) {
              assignedUserName = assignedUser.name;
            }
          }
          
          return {
            ...task,
            ...updateData,
            assigned_user_name: assignedUserName
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      resetForm();
      setEditingTaskId(null);
      
      // Notify parent of change
      if (onTasksChange) {
        onTasksChange();
      }
      
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      const { error } = await (supabase as any)
        .from('project_tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Notify parent of change
      if (onTasksChange) {
        onTasksChange();
      }
      
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const startEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      due_date: task.due_date || '',
      assigned_to: task.assigned_to || '',
    });
    setEditingTaskId(task.id);
    setIsAddingTask(false);
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      due_date: '',
      assigned_to: '',
    });
  };
  
  const cancelForm = () => {
    resetForm();
    setIsAddingTask(false);
    setEditingTaskId(null);
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
            onClick={() => {
              setIsAddingTask(true);
              setEditingTaskId(null);
            }}
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
        <Card className="p-3 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">
            {editingTaskId ? 'Edit Task' : 'Add New Task'}
          </h4>
          <form onSubmit={editingTaskId ? (e) => handleUpdateTask(editingTaskId, e) : handleAddTask} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-1 text-sm border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-1 text-sm border rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1 text-sm border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1 text-sm border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1 text-sm border rounded-md"
                >
                  <option value="">Not Assigned</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
                <X size={12} className="mr-1" />
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Check size={12} className="mr-1" />
                {editingTaskId ? 'Update' : 'Add'} Task
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {tasks.length === 0 && !isAddingTask ? (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No tasks yet</p>
          {canEdit && (
            <Button 
              onClick={() => setIsAddingTask(true)} 
              size="sm"
              variant="outline"
              className="mt-2"
            >
              <Plus size={14} className="mr-1" />
              Add First Task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="p-3 bg-white rounded-md border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge className={statusColors[task.status as keyof typeof statusColors] || 'bg-gray-100'}>
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
                      onClick={() => startEditTask(task)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;
