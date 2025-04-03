
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
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          throw new Error('No authentication session found');
        }
        
        console.log('Invoking n8n-workflows function with action=sync');
        const response = await supabase.functions.invoke('n8n-workflows', {
          body: { action: 'sync' }
        });
        
        // Log full response for debugging
        console.log('Edge function raw response:', response);
        
        if (response.error) {
          console.error('Edge function error:', response.error);
          throw new Error(response.error.message || 'Failed to sync workflows');
        }
        
        if (!response.data) {
          throw new Error('No data returned from workflow sync');
        }
        
        console.log('Sync response data:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Workflow sync detailed error:', error);
        throw error;
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
