
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define types for better type safety
interface InstantlyWorkflow {
  id: string;
  workflow_id: string;
  workflow_name: string;
  description: string | null;
  status: string;
  is_active: boolean;
  tags: string[];
  raw_data: any;
  created_at: string;
  updated_at: string;
}

interface InstantlyConfig {
  id: string;
  api_key: string;
  api_url: string;
  created_at: string;
  last_updated: string | null;
}

interface InstantlyLog {
  id: string;
  timestamp: string;
  endpoint: string;
  status: number;
  duration_ms: number | null;
  error_message: string | null;
}

// Interface for the RPC response
interface WorkflowsResponse {
  workflows: InstantlyWorkflow[];
  totalCount: number;
}

interface LogsResponse {
  logs: InstantlyLog[];
  totalCount: number;
}

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
        
        // Fix 1: Use explicit cast with unknown to handle generic data type
        const { data, error } = await supabase
          .rpc('get_instantly_workflows', {
            search_term: searchTerm ? `%${searchTerm}%` : null,
            sort_field: sortField,
            sort_direction: sortDirection,
            page_from: from,
            page_to: to
          });
        
        if (error) {
          console.error('Error fetching workflows:', error);
          throw error;
        }
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          return { workflows: [], totalCount: 0 };
        }
        
        // Fix 2: Safe access of count property with type checking
        const totalCount = Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'count' in data[0] 
          ? Number(data[0].count) 
          : 0;
        
        // Map data to InstantlyWorkflow type
        const workflows: InstantlyWorkflow[] = data.map(item => ({
          id: item.id,
          workflow_id: item.workflow_id,
          workflow_name: item.workflow_name,
          description: item.description,
          status: item.status,
          is_active: item.is_active,
          tags: item.tags || [],
          raw_data: item.raw_data,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        return {
          workflows,
          totalCount
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
      try {
        // Fix 3: Remove generic type parameter that was causing issues
        const { data, error } = await supabase.rpc('get_instantly_config');
        
        if (error) {
          console.error('Error fetching config:', error);
          return null;
        }
        
        // Fix 4: Safely check if data is an array with entries
        if (data && Array.isArray(data) && data.length > 0) {
          return {
            id: data[0].id,
            api_key: data[0].api_key,
            api_url: data[0].api_url,
            created_at: data[0].created_at,
            last_updated: data[0].last_updated
          } as InstantlyConfig;
        }
        
        return null;
      } catch (error) {
        console.error('Error fetching config:', error);
        return null;
      }
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
        
        // Fix 5: Remove generic type parameter that was causing issues
        const { data, error } = await supabase.rpc('get_instantly_logs', {
          page_from: from,
          page_to: to
        });
        
        if (error) {
          console.error('Error fetching logs:', error);
          throw error;
        }
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          return { logs: [], totalCount: 0 };
        }
        
        // Fix 6: Safe access of count property with type checking
        const totalCount = Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'count' in data[0] 
          ? Number(data[0].count) 
          : 0;
        
        // Map data to InstantlyLog type
        const logs: InstantlyLog[] = data.map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          endpoint: item.endpoint,
          status: item.status,
          duration_ms: item.duration_ms,
          error_message: item.error_message
        }));
        
        return {
          logs,
          totalCount
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
