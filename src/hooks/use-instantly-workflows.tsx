
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useInstantlyWorkflows() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Fetch workflows with pagination, search, and sorting
  const { 
    data: workflowsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['instantly-workflows', searchTerm, sortField, sortDirection, currentPage, pageSize],
    queryFn: async () => {
      try {
        // Calculate range for pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        
        let query = supabase
          .from('instantly_integration.workflows')
          .select('*', { count: 'exact' });
          
        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(
            `workflow_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
          );
        }
        
        // Apply sorting
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
        
        // Apply pagination
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        if (error) {
          console.error('Error fetching workflows:', error);
          throw error;
        }
        
        return {
          workflows: data || [],
          totalCount: count || 0
        };
      } catch (error) {
        console.error('Error in fetch function:', error);
        throw error;
      }
    }
  });
  
  // Fetch last sync info
  const { data: configData } = useQuery({
    queryKey: ['instantly-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instantly_integration.config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching config:', error);
        return null;
      }
      
      return data;
    }
  });
  
  // Sync workflows mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      try {
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
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
        
        console.log('Invoking instantly-api edge function');
        
        // Call edge function with access token
        const response = await supabase.functions.invoke('instantly-api', {
          body: { action: 'sync_workflows' },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        console.log('Edge function response:', response);
        
        if (response.error) {
          console.error('Edge function error:', response.error);
          throw new Error(response.error.message || 'Failed to sync workflows');
        }
        
        return response.data;
      } catch (error: any) {
        console.error('Sync error details:', error);
        throw new Error(error.message || 'An unknown error occurred');
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Workflows synced successfully',
        description: data.message || `Synced workflows: ${data.inserted} new, ${data.updated} updated`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['instantly-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['instantly-config'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to sync workflows',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  });
  
  // Get logs query
  const { 
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['instantly-logs', currentPage, pageSize],
    queryFn: async () => {
      try {
        // Calculate range for pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error, count } = await supabase
          .from('instantly_integration.logs')
          .select('*', { count: 'exact' })
          .order('timestamp', { ascending: false })
          .range(from, to);
        
        if (error) {
          console.error('Error fetching logs:', error);
          throw error;
        }
        
        return {
          logs: data || [],
          totalCount: count || 0
        };
      } catch (error) {
        console.error('Error in fetch logs function:', error);
        throw error;
      }
    },
    enabled: false // Only load when needed
  });
  
  return {
    workflows: workflowsData?.workflows,
    totalCount: workflowsData?.totalCount || 0,
    isLoading,
    error,
    configData,
    syncMutation,
    searchTerm,
    setSearchTerm,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    refetch,
    
    // Logs data
    logs: logsData?.logs,
    logsCount: logsData?.totalCount || 0,
    isLoadingLogs,
    logsError,
    loadLogs: refetchLogs
  };
}
