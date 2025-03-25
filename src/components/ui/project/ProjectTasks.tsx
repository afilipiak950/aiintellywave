
import { useState, useEffect } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { Plus, Edit, Trash2, Check, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { useAuth } from '../../../context/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string;
}

interface ProjectTasksProps {
  projectId: string;
  milestoneId: string;
  canEdit: boolean;
  onTasksChange?: () => void;
}

const statusIcons = {
  'pending': Clock,
  'in_progress': AlertCircle,
  'completed': CheckCircle,
};

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
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    assigned_to: '',
  });
  
  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [projectId, milestoneId]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          *,
          assigned_user:assigned_to(
            id,
            first_name,
            last_name
          )
        `)
        .eq('project_id', projectId)
        .eq('milestone_id', milestoneId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        const formattedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date,
          assigned_to: task.assigned_to,
          assigned_user_name: task.assigned_user ? 
            `${task.assigned_user.first_name || ''} ${task.assigned_user.last_name || ''}`.trim() || 'Unnamed User' : 
            undefined
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
  
  const fetchTeamMembers = async () => {
    try {
      if (!user?.companyId) return;
      
      // Get company users (team members)
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from('company_users')
        .select(`
          user_id
        `)
        .eq('company_id', user.companyId);
        
      if (companyUsersError) throw companyUsersError;
      
      if (companyUsersData && companyUsersData.length > 0) {
        const userIds = companyUsersData.map(cu => cu.user_id);
        
        // Get user profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
          
        if (profilesData) {
          const members = profilesData.map(profile => ({
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User'
          }));
          
          setTeamMembers(members);
        }
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
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
      
      const { data, error } = await supabase
        .from('project_tasks')
        .insert(newTask)
        .select(`
          *,
          assigned_user:assigned_to(
            id,
            first_name,
            last_name
          )
        `)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const assignedUserName = data.assigned_user ? 
          `${data.assigned_user.first_name || ''} ${data.assigned_user.last_name || ''}`.trim() || 'Unnamed User' : 
          undefined;
          
        const newFormattedTask = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          due_date: data.due_date,
          assigned_to: data.assigned_to,
          assigned_user_name: assignedUserName
        };
        
        setTasks([...tasks, newFormattedTask]);
        
        resetForm();
        setIsAddingTask(false);
        
        // Notify parent component that tasks have changed
        if (onTasksChange) onTasksChange();
        
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
      
      const { error } = await supabase
        .from('project_tasks')
        .update(updateData)
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          // Find assigned user name if relevant
          let assignedUserName;
          if (updateData.assigned_to) {
            const assignedMember = teamMembers.find(m => m.id === updateData.assigned_to);
            assignedUserName = assignedMember?.name;
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
      
      // Notify parent component that tasks have changed
      if (onTasksChange) onTasksChange();
      
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
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Notify parent component that tasks have changed
      if (onTasksChange) onTasksChange();
      
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
  
  const handleQuickStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus } 
          : task
      ));
      
      // Notify parent component that tasks have changed
      if (onTasksChange) onTasksChange();
      
      toast({
        title: "Success",
        description: "Task status updated.",
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
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
  
  // Determine if current user can mark tasks as complete (assigned to them)
  const canUpdateOwnTasks = (taskId: string, assignedTo: string | null) => {
    return user?.id === assignedTo && !canEdit;
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
      
      {isAddingTask && (
        <Card className="p-3 border-blue-200 bg-blue-50">
          <form onSubmit={handleAddTask} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-1.5 text-sm border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-1.5 text-sm border rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                >
                  <option value="">Not Assigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add Task
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {tasks.length === 0 && !isAddingTask ? (
        <div className="text-center py-4 text-sm text-gray-500">
          No tasks created yet. 
          {canEdit && " Click 'Add Task' to get started."}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => {
            const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Clock;
            const isEditing = editingTaskId === task.id;
            const canActOnTask = canEdit || canUpdateOwnTasks(task.id, task.assigned_to);
            
            return (
              <Card key={task.id} className="p-3">
                {isEditing ? (
                  <form onSubmit={(e) => handleUpdateTask(task.id, e)} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-1.5 text-sm border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm border rounded-md"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          type="date"
                          name="due_date"
                          value={formData.due_date}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 text-sm border rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 text-sm border rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                          name="assigned_to"
                          value={formData.assigned_to}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 text-sm border rounded-md"
                        >
                          <option value="">Not Assigned</option>
                          {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-1">
                      <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
                        <X size={14} className="mr-1" />
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        <Check size={14} className="mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={`ml-2 flex items-center gap-1 ${statusColors[task.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                            <StatusIcon size={12} />
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                        )}
                      </div>
                      
                      {canActOnTask && (
                        <div className="flex space-x-1">
                          {canEdit && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => startEditTask(task)}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                          
                          {(canUpdateOwnTasks(task.id, task.assigned_to) || canEdit) && task.status !== 'completed' && (
                            <Button 
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              variant="ghost"
                              onClick={() => handleQuickStatusUpdate(task.id, 'completed')}
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                      {task.assigned_to && task.assigned_user_name && (
                        <div>Assigned to: {task.assigned_user_name}</div>
                      )}
                      
                      {task.due_date && (
                        <div>Due: {new Date(task.due_date).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;
