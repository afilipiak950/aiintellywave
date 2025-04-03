
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

  // Sync workflows mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Starting workflow sync process');
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          throw new Error('No authentication session found');
        }
        
        console.log('Invoking n8n-workflows function with action=sync');
        const { data, error } = await supabase.functions.invoke('n8n-workflows', {
          body: { action: 'sync' }
        });
        
        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Failed to sync workflows');
        }
        
        if (!data) {
          throw new Error('No data returned from workflow sync');
        }
        
        console.log('Sync response:', data);
        return data;
      } catch (error) {
        console.error('Workflow sync error:', error);
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
    onError: (error) => {
      console.error('Workflow Sync Error:', error);
      toast({
        title: 'Failed to sync workflows',
        description: error.message,
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
