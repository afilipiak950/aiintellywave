
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { useAuth } from '../context/auth';
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
      
      // First get all feedback entries
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('project_feedback')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
        
      if (feedbackError) throw feedbackError;
      
      if (feedbackData && feedbackData.length > 0) {
        // Get all user profiles in a separate query
        const userIds = feedbackData.map(item => item.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Map user profiles to feedback items
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
        
        // Convert to our Feedback type
        const formattedFeedback: Feedback[] = feedbackData.map((item: ProjectFeedbackRow) => {
          const profile = profilesMap.get(item.user_id);
          return {
            id: item.id,
            content: item.content,
            user_id: item.user_id,
            user_name: profile ? 
              `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User' : 
              'Unknown User',
            user_avatar: profile?.avatar_url,
            created_at: item.created_at,
            is_deleted: item.is_deleted
          };
        });
        
        setFeedback(formattedFeedback);
      } else {
        setFeedback([]);
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
      
      // Insert feedback
      const { data: newFeedbackData, error: insertError } = await supabase
        .from('project_feedback')
        .insert(feedbackData)
        .select('*')
        .single();
        
      if (insertError) throw insertError;
      
      if (newFeedbackData) {
        // Get the user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user?.id)
          .single();
          
        if (profileError) {
          console.warn('Could not fetch profile data:', profileError);
        }
        
        // Create a new feedback item
        const newFeedbackItem: Feedback = {
          id: newFeedbackData.id,
          content: newFeedbackData.content,
          user_id: newFeedbackData.user_id,
          user_name: profileData ? 
            `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unnamed User' : 
            user?.email || 'Unknown User',
          user_avatar: profileData?.avatar_url,
          created_at: newFeedbackData.created_at,
          is_deleted: newFeedbackData.is_deleted
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
      const { error } = await supabase
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
