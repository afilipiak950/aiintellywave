
import { useState, useEffect } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { Send, Trash2, AlertCircle } from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useAuth } from '../../../context/AuthContext';

interface Feedback {
  id: string;
  content: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  created_at: string;
  is_deleted: boolean;
}

interface ProjectFeedbackProps {
  projectId: string;
}

const ProjectFeedback = ({ projectId }: ProjectFeedbackProps) => {
  const { user, isAdmin, isManager } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchFeedback();
  }, [projectId]);
  
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
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
        const formattedFeedback = data.map(item => ({
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
      
      const { data, error } = await supabase
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
        const newFeedbackItem = {
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
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitFeedback} className="space-y-3">
        <div>
          <label htmlFor="new-feedback" className="block font-medium text-gray-700 mb-1">
            Add Feedback
          </label>
          <textarea
            id="new-feedback"
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            rows={3}
            placeholder="Share your thoughts, feedback, or questions about this project..."
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || !newFeedback.trim()}>
            <Send size={16} className="mr-2" />
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
      
      <Separator />
      
      {feedback.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No feedback yet</h3>
          <p className="text-gray-500 mt-1">
            Be the first to provide feedback on this project.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map(item => (
            <Card key={item.id} className="p-4">
              <div className="flex space-x-3">
                <Avatar className="h-10 w-10">
                  {item.user_avatar ? (
                    <AvatarImage src={item.user_avatar} alt={item.user_name} />
                  ) : (
                    <AvatarFallback>{item.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.user_name}</p>
                      <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    
                    {canDeleteFeedback(item.user_id) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-2 text-gray-700 whitespace-pre-line">
                    {item.content}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectFeedback;
