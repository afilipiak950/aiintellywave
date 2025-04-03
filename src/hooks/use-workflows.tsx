
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
        
        // Check authentication
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          console.error('No authentication session found');
          throw new Error('No authentication session found. Please log in again.');
        }
        
        console.log('Invoking n8n-workflows function with action=sync');
        const response = await supabase.functions.invoke('n8n-workflows', {
          body: { action: 'sync' },
          headers: {
            Authorization: `Bearer ${session.session.access_token}`
          }
        });
        
        // Log full response for debugging
        console.log('Edge function response:', response);
        
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
        
        // Enhance error message with more diagnostics
        let errorMessage = error.message || 'Unknown error occurred';
        
        // Add specific diagnostics based on error type
        if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error: Could not connect to the edge function. Please check your internet connection.';
        } else if (error.message?.includes('Unauthorized') || error.message?.includes('JWT')) {
          errorMessage = 'Authentication error: Your session may have expired. Please try logging out and in again.';
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Workflows synced successfully',
        description: `${data.results?.length || 0} workflows processed`,
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
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
