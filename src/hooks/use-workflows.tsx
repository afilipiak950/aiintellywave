
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useWorkflows() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch workflows
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data;
    }
  });

  // Sync workflows mutation with improved error handling
  const syncMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Starting workflow sync process');
        
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Handle session error or missing session
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData?.session) {
          console.error('No active session found');
          throw new Error('You need to be logged in to sync workflows');
        }
        
        // Get access token from session
        const accessToken = sessionData.session.access_token;
        if (!accessToken) {
          console.error('No access token found in session');
          throw new Error('Authentication token is missing');
        }
        
        console.log('Invoking n8n-workflows function with action=sync');
        
        // Make the function call with proper authorization
        const response = await supabase.functions.invoke('n8n-workflows', {
          body: { action: 'sync' },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Log full response for debugging
        console.log('Edge function response:', response);
        
        // Check for error in data itself (for cases where HTTP status is 200 but there's an error in the data)
        if (response.data && response.data.success === false) {
          console.error('Edge function returned error in data:', response.data.error);
          throw new Error(response.data.error || 'Failed to sync workflows');
        }
        
        // Check for function error
        if (response.error) {
          console.error('Edge function error:', response.error);
          throw new Error(response.error.message || 'Failed to sync workflows');
        }
        
        if (!response.data) {
          console.error('No data returned from workflow sync');
          throw new Error('No data returned from workflow sync');
        }
        
        console.log('Sync response data:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Workflow sync detailed error:', error);
        
        // Enhance error message based on error type
        let errorMessage = error.message || 'Unknown error occurred';
        
        // Check for network errors
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('NetworkError') ||
            error.message?.includes('Failed to send')) {
          errorMessage = 'Failed to send a request to the Edge Function. Please check your network connection and function configuration.';
        } 
        // Check for authentication errors
        else if (error.message?.includes('Unauthorized') || 
                error.message?.includes('JWT') ||
                error.message?.includes('auth')) {
          errorMessage = 'Authentication error: Your session may have expired. Please try logging out and in again.';
        }
        // Check for n8n API errors
        else if (error.message?.includes('n8n API')) {
          errorMessage = `Connection to n8n failed: ${error.message}`;
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Workflows synced successfully',
        description: data.message || `${data.results?.length || 0} workflows processed`,
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error: any) => {
      console.error('Workflow Sync Error:', error);
      toast({
        title: 'Failed to sync workflows',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Filter workflows based on search term
  const filteredWorkflows = workflows?.filter(workflow => {
    return (
      workflow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return {
    workflows,
    filteredWorkflows,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    syncMutation
  };
}
