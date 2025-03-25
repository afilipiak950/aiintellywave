
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";
import { useAuth } from '../context/AuthContext';
import { Feedback, ProjectFeedbackRow } from '../types/project';

export const useProjectFeedback = (projectId: string) => {
  const { user, isAdmin, isManager } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      fetchFeedback();
    }
  }, [projectId]);
  
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      // Use raw query with type casting
      const { data, error } = await (supabase as any)
        .from('project_feedback')
        .select(`
          *,
          feedback_user:user_id(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Convert to our Feedback type
        const formattedFeedback: Feedback[] = data.map((item: any) => ({
          id: item.id,
          content: item.content,
          user_id: item.user_id,
          user_name: item.feedback_user ? 
            `${item.feedback_user.first_name || ''} ${item.feedback_user.last_name || ''}`.trim() || 'Unnamed User' : 
            'Unknown User',
          user_avatar: item.feedback_user?.avatar_url,
          created_at: item.created_at,
          is_deleted: item.is_deleted
        }));
        
        setFeedback(formattedFeedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFeedback.trim()) return;
    
    try {
      setSubmitting(true);
      
      const feedbackData = {
        project_id: projectId,
        user_id: user?.id,
        content: newFeedback,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      };
      
      // Use raw query for insert with type casting
      const { data, error } = await (supabase as any)
        .from('project_feedback')
        .insert(feedbackData)
        .select(`
          *,
          feedback_user:user_id(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Create a new feedback item
        const newFeedbackItem: Feedback = {
          id: data.id,
          content: data.content,
          user_id: data.user_id,
          user_name: data.feedback_user ? 
            `${data.feedback_user.first_name || ''} ${data.feedback_user.last_name || ''}`.trim() || 'Unnamed User' : 
            'Unknown User',
          user_avatar: data.feedback_user?.avatar_url,
          created_at: data.created_at,
          is_deleted: data.is_deleted
        };
        
        setFeedback([newFeedbackItem, ...feedback]);
        setNewFeedback('');
        
        toast({
          title: "Success",
          description: "Feedback submitted successfully.",
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    try {
      // Soft delete by updating is_deleted flag
      const { error } = await (supabase as any)
        .from('project_feedback')
        .update({ is_deleted: true })
        .eq('id', feedbackId);
        
      if (error) throw error;
      
      // Update local state
      setFeedback(feedback.filter(item => item.id !== feedbackId));
      
      toast({
        title: "Success",
        description: "Feedback deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to delete feedback. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Check if user can delete feedback (admins, managers, or own feedback)
  const canDeleteFeedback = (feedbackUserId: string) => {
    return isAdmin || isManager || user?.id === feedbackUserId;
  };
  
  return {
    feedback,
    loading,
    newFeedback,
    submitting,
    setNewFeedback,
    handleSubmitFeedback,
    handleDeleteFeedback,
    canDeleteFeedback
  };
};
