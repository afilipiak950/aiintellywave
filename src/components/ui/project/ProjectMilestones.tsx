import { useState, useEffect } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { Plus, Edit, Trash2, Check, X, AlertCircle, Hourglass, CheckCircle } from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Progress } from "../../ui/progress";
import ProjectTasks from './ProjectTasks';
import { useAuth } from '../../../context/auth';
import { Milestone, ProjectMilestoneRow } from '../../../types/project';

interface ProjectMilestonesProps {
  projectId: string;
  canEdit: boolean;
}

const statusIcons = {
  'pending': Hourglass,
  'in_progress': AlertCircle,
  'completed': CheckCircle,
};

const statusColors = {
  'pending': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'completed': 'bg-green-100 text-green-700',
};

const ProjectMilestones = ({ projectId, canEdit }: ProjectMilestonesProps) => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
  });
  
  useEffect(() => {
    fetchMilestones();
  }, [projectId]);
  
  const fetchMilestones = async () => {
    try {
      setLoading(true);
      
      // First get all milestones with type casting
      const { data: milestonesData, error: milestonesError } = await (supabase as any)
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
        
      if (milestonesError) throw milestonesError;
      
      // Get task counts for each milestone
      const milestonesWithTasks = await Promise.all(
        (milestonesData || []).map(async (milestone: any) => {
          // Get total task count
          const { count: taskCount, error: taskCountError } = await (supabase as any)
            .from('project_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('milestone_id', milestone.id);
            
          if (taskCountError) throw taskCountError;
          
          // Get completed task count
          const { count: completedTaskCount, error: completedTaskCountError } = await (supabase as any)
            .from('project_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('milestone_id', milestone.id)
            .eq('status', 'completed');
            
          if (completedTaskCountError) throw completedTaskCountError;
            
          // Convert to our Milestone type
          return {
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            due_date: milestone.due_date,
            status: milestone.status,
            created_at: milestone.created_at,
            updated_at: milestone.updated_at,
            taskCount: taskCount || 0,
            completedTaskCount: completedTaskCount || 0,
          } as Milestone;
        })
      );
      
      setMilestones(milestonesWithTasks);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast({
        title: "Error",
        description: "Failed to load milestones. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newMilestone = {
        project_id: projectId,
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date || null,
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await (supabase as any)
        .from('project_milestones')
        .insert(newMilestone)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Add the new milestone to our state
        const newMilestoneWithTasks: Milestone = {
          id: data.id,
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
          taskCount: 0,
          completedTaskCount: 0
        };
        
        setMilestones([...milestones, newMilestoneWithTasks]);
        
        resetForm();
        setIsAddingMilestone(false);
        
        toast({
          title: "Success",
          description: "Milestone added successfully.",
        });
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast({
        title: "Error",
        description: "Failed to add milestone. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateMilestone = async (milestoneId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date || null,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await (supabase as any)
        .from('project_milestones')
        .update(updateData)
        .eq('id', milestoneId);
        
      if (error) throw error;
      
      // Update local state
      setMilestones(
        milestones.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, ...updateData } 
            : milestone
        )
      );
      
      resetForm();
      setEditingMilestoneId(null);
      
      toast({
        title: "Success",
        description: "Milestone updated successfully.",
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!window.confirm('Are you sure you want to delete this milestone? This will also delete all associated tasks.')) {
      return;
    }
    
    try {
      const { error } = await (supabase as any)
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId);
        
      if (error) throw error;
      
      // Update local state
      setMilestones(milestones.filter(milestone => milestone.id !== milestoneId));
      
      toast({
        title: "Success",
        description: "Milestone deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast({
        title: "Error",
        description: "Failed to delete milestone. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const startEditMilestone = (milestone: Milestone) => {
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      due_date: milestone.due_date || '',
      status: milestone.status,
    });
    setEditingMilestoneId(milestone.id);
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      status: 'pending',
    });
  };
  
  const cancelForm = () => {
    resetForm();
    setIsAddingMilestone(false);
    setEditingMilestoneId(null);
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
        <Card className="p-4 border-blue-200 bg-blue-50">
          <h3 className="font-medium mb-2">Add New Milestone</h3>
          <form onSubmit={handleAddMilestone} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add Milestone
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {milestones.length === 0 && !isAddingMilestone ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No milestones yet</h3>
          <p className="text-gray-500 mt-1">
            Get started by adding the first milestone to this project.
          </p>
          {canEdit && (
            <Button 
              onClick={() => setIsAddingMilestone(true)} 
              className="mt-4"
            >
              <Plus size={16} className="mr-1" />
              Add First Milestone
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map(milestone => {
            const StatusIcon = statusIcons[milestone.status as keyof typeof statusIcons] || Hourglass;
            const isExpanded = expandedMilestoneId === milestone.id;
            const isEditing = editingMilestoneId === milestone.id;
            const progressPercentage = milestone.taskCount > 0 
              ? Math.round((milestone.completedTaskCount / milestone.taskCount) * 100)
              : 0;
              
            return (
              <Card key={milestone.id} className="overflow-hidden">
                {isEditing ? (
                  <div className="p-4 bg-blue-50">
                    <form onSubmit={(e) => handleUpdateMilestone(milestone.id, e)} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                          <input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-2">
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
                  </div>
                ) : (
                  <>
                    <div 
                      className="p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{milestone.title}</h3>
                          {milestone.description && (
                            <p className="text-gray-500 text-sm mt-1">{milestone.description}</p>
                          )}
                        </div>
                        
                        <Badge className={`flex items-center gap-1 ${statusColors[milestone.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                          <StatusIcon size={14} />
                          <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
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
                                startEditMilestone(milestone);
                              }}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMilestone(milestone.id);
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
                          onTasksChange={fetchMilestones}
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;
