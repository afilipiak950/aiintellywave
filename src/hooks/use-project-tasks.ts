
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Task } from '../types/project';
import { toast } from "../hooks/use-toast";

interface UseProjectTasksProps {
  projectId: string;
  milestoneId: string;
}

export const useProjectTasks = ({ projectId, milestoneId }: UseProjectTasksProps) => {
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
    fetchUsers();
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
        
        toast({
          title: "Success",
          description: "Task added successfully.",
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    return false;
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
      
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return false;
    }
    
    try {
      const { error } = await (supabase as any)
        .from('project_tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
      return false;
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

  return {
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
    cancelForm,
    resetForm
  };
};
