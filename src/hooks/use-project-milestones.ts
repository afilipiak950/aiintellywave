
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Milestone, Task } from '../types/project';
import { toast } from "../hooks/use-toast";

interface UseProjectMilestonesProps {
  projectId: string;
}

export const useProjectMilestones = ({ projectId }: UseProjectMilestonesProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
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
        
        return true;
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast({
        title: "Error",
        description: "Failed to add milestone. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    return false;
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
      
      return true;
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!window.confirm('Are you sure you want to delete this milestone? This will also delete all associated tasks.')) {
      return false;
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
      
      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast({
        title: "Error",
        description: "Failed to delete milestone. Please try again.",
        variant: "destructive"
      });
      return false;
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
  
  return {
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
    resetForm,
    fetchMilestones
  };
};
