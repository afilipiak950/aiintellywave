import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/useAuth';

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

interface InstantlyCampaign {
  id: string;
  campaign_id: string;
  name: string;
  description: string | null;
  status: string;
  is_active: boolean;
  tags: string[];
  statistics: any;
  start_date: string | null;
  end_date: string | null;
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

interface WorkflowsResponse {
  workflows: InstantlyWorkflow[];
  totalCount: number;
}

interface CampaignsResponse {
  campaigns: InstantlyCampaign[];
  totalCount: number;
  source?: string;
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
  const { session, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User is not authenticated, queries will be disabled');
    } else {
      console.log('User is authenticated, queries will be enabled');
    }
  }, [isAuthenticated]);
  
  const getAuthHeader = async () => {
    if (session?.access_token) {
      return `Bearer ${session.access_token}`;
    }
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error: Unable to get session');
      }
      
      if (!sessionData?.session?.access_token) {
        console.error('No access token found in session');
        throw new Error('Authentication error: No access token');
      }
      
      return `Bearer ${sessionData.session.access_token}`;
    } catch (error) {
      console.error('Error in getAuthHeader:', error);
      throw error;
    }
  };
  
  const { 
    data: workflowsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['instantly-workflows', searchTerm, sortField, sortDirection, currentPage, pageSize],
    queryFn: async () => {
      try {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error } = await supabase.rpc(
          'get_instantly_workflows', 
          {
            search_term: searchTerm ? `%${searchTerm}%` : null,
            sort_field: sortField,
            sort_direction: sortDirection,
            page_from: from,
            page_to: to
          }
        );
        
        if (error) {
          console.error('Error fetching workflows:', error);
          throw error;
        }
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          return { workflows: [], totalCount: 0 };
        }
        
        const totalCount = Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'count' in data[0] 
          ? Number(data[0].count) 
          : 0;
        
        const workflows = data.map((item: any) => ({
          id: item.id,
          workflow_id: item.workflow_id,
          workflow_name: item.workflow_name,
          description: item.description,
          status: item.status,
          is_active: item.is_active,
          tags: Array.isArray(item.tags) ? item.tags : [],
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
  
  const { 
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    error: campaignsError,
    refetch: refetchCampaigns
  } = useQuery({
    queryKey: ['instantly-campaigns', searchTerm, sortField, sortDirection, currentPage, pageSize],
    queryFn: async () => {
      try {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        
        console.log('Fetching campaigns with params:', {
          from, to, searchTerm, sortField, sortDirection
        });
        
        const { data, error } = await supabase.rpc(
          'get_instantly_campaigns', 
          {
            page_from: from,
            page_to: to,
            search_term: searchTerm ? `%${searchTerm}%` : null,
            sort_field: sortField,
            sort_direction: sortDirection
          }
        );
        
        if (error) {
          console.error('Error fetching campaigns from database:', error);
          throw new Error(`Database query failed: ${error.message}`);
        }
        
        console.log('Raw campaigns data from supabase:', data);
        
        if (data && Array.isArray(data) && data.length > 0) {
          const totalCount = Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'count' in data[0] 
            ? Number(data[0].count) 
            : 0;
          
          const campaigns = data.map((item: any) => ({
            id: item.id,
            campaign_id: item.campaign_id,
            name: item.name,
            description: item.description,
            status: item.status,
            is_active: item.is_active,
            tags: Array.isArray(item.tags) ? item.tags : [],
            statistics: item.statistics || {},
            start_date: item.start_date,
            end_date: item.end_date,
            raw_data: item.raw_data,
            created_at: item.created_at,
            updated_at: item.updated_at
          }));
          
          return {
            campaigns,
            totalCount,
            source: 'database'
          };
        }
        
        console.log('No campaigns in database, fetching from Instantly API via edge function');
        
        const authToken = await getAuthHeader();
        
        if (!authToken) {
          console.error('Failed to get auth token');
          throw new Error('Authentication error: Failed to get auth token');
        }
        
        console.log('Invoking instantly-ai edge function with supabase client');
        console.log('Using auth token (first 10 chars):', authToken.substring(0, 10));
        
        try {
          const response = await supabase.functions.invoke('instantly-ai', {
            body: { action: 'fetchCampaigns' },
            headers: {
              Authorization: authToken
            }
          });
          
          console.log('Edge function response via supabase client:', response);
          
          if (response.error) {
            console.error('Error details:', response.error);
            throw new Error(`Edge function error: ${response.error.message || JSON.stringify(response.error)}`);
          }
          
          if (!response.data || !response.data.campaigns) {
            throw new Error('Invalid response format from edge function');
          }
          
          return {
            campaigns: response.data.campaigns,
            totalCount: response.data.count || response.data.campaigns.length,
            source: response.data.status === 'fallback' ? 'fallback' : 'api'
          };
        } catch (invokeError) {
          console.error('Error invoking edge function via supabase client:', invokeError);
          
          console.log('Trying direct fetch to edge function as fallback');
          
          const baseUrl = "https://ootziscicbahucatxyme.functions.supabase.co";
          const functionUrl = `${baseUrl}/instantly-ai`;
          
          console.log(`Attempting direct fetch to: ${functionUrl}`);
          console.log('Using auth token (first 10 chars):', authToken.substring(0, 10));
          
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'fetchCampaigns' })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Edge function direct fetch error:', errorText);
            throw new Error(`Edge function error: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Edge function direct fetch response:', data);
          
          if (!data.campaigns) {
            throw new Error('Invalid response format from edge function');
          }
          
          return {
            campaigns: data.campaigns,
            totalCount: data.count || data.campaigns.length,
            source: data.status === 'fallback' ? 'fallback' : 'api'
          };
        }
      } catch (error) {
        console.error('Error in fetch campaigns function:', error);
        throw error;
      }
    },
    enabled: isAuthenticated
  });
  
  const { data: configData } = useQuery({
    queryKey: ['instantly-config'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_instantly_config');
        
        if (error) {
          console.error('Error fetching config:', error);
          return null;
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          const item = data[0] as any;
          return {
            id: item.id,
            api_key: item.api_key,
            api_url: item.api_url,
            created_at: item.created_at,
            last_updated: item.last_updated
          } as InstantlyConfig;
        }
        
        return null;
      } catch (error) {
        console.error('Error fetching config:', error);
        return null;
      }
    }
  });
  
  const syncWorkflowsMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData?.session) {
          console.error('No active session found');
          throw new Error('You need to be logged in to sync workflows');
        }
        
        const accessToken = sessionData.session.access_token;
        if (!accessToken) {
          console.error('No access token found in session');
          throw new Error('Invalid authentication token');
        }
        
        console.log('Invoking instantly-ai edge function with valid token');
        
        try {
          const response = await supabase.functions.invoke('instantly-ai', {
            body: { action: 'syncWorkflows' },
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
        } catch (invokeError) {
          console.error('Error invoking edge function via supabase client:', invokeError);
          
          console.log('Trying direct fetch to edge function as fallback');
          
          const baseUrl = "https://ootziscicbahucatxyme.functions.supabase.co";
          const functionUrl = `${baseUrl}/instantly-ai`;
          
          console.log(`Attempting direct fetch to: ${functionUrl}`);
          
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'syncWorkflows' })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Edge function direct fetch error:', errorText);
            throw new Error(`Edge function error: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Edge function direct fetch response:', data);
          
          return data;
        }
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
  
  const syncCampaignsMutation = useMutation({
    mutationFn: async () => {
      try {
        const authToken = await getAuthHeader();
        
        if (!authToken) {
          throw new Error('Invalid authentication token');
        }
        
        console.log('Syncing campaigns from Instantly API with valid token');
        console.log('Using auth token (first 10 chars):', authToken.substring(0, 10));
        
        try {
          const response = await supabase.functions.invoke('instantly-ai', {
            body: { action: 'fetchCampaigns' },
            headers: {
              'Authorization': authToken
            }
          });
          
          if (response.error) {
            console.error('Edge function detailed error:', response.error);
            throw new Error(`Edge function error: ${response.error.message || JSON.stringify(response.error)}`);
          }
          
          return { 
            message: `Synced ${response.data?.campaigns?.length || 0} campaigns successfully`,
            campaigns: response.data?.campaigns || [],
            source: response.data?.status || 'api'
          };
        } catch (invokeError) {
          console.error('Error invoking edge function:', invokeError);
          
          console.log('Trying direct fetch to edge function with proper auth');
          
          const functionUrl = "https://ootziscicbahucatxyme.functions.supabase.co/instantly-ai";
          
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'fetchCampaigns' })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Edge function error (status ${response.status}):`, errorText);
            throw new Error(`Edge function error: ${errorText}`);
          }
          
          const data = await response.json();
          
          return { 
            message: `Synced ${data?.campaigns?.length || 0} campaigns successfully`,
            campaigns: data?.campaigns || [],
            source: data?.status || 'api'
          };
        }
      } catch (error: any) {
        console.error('Sync campaigns error details:', error);
        throw new Error(`Failed to sync campaigns: ${error.message}`);
      }
    },
    onSuccess: (data) => {
      if (data.source === 'fallback' || data.source === 'mock') {
        toast({
          title: 'Using cached campaign data',
          description: 'Could not connect to Instantly API. Showing locally cached data instead.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Campaigns synced successfully',
          description: data.message || `Synced ${data.campaigns.length} campaigns`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['instantly-campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to sync campaigns',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const { 
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['instantly-logs', currentPage, pageSize],
    queryFn: async () => {
      try {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        
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
        
        const totalCount = Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'count' in data[0] 
          ? Number(data[0].count) 
          : 0;
        
        const logs = data.map((item: any) => ({
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
    enabled: false
  });
  
  return {
    workflows: workflowsData?.workflows,
    totalCount: workflowsData?.totalCount || 0,
    isLoading,
    error,
    configData,
    syncWorkflowsMutation,
    
    campaigns: campaignsData?.campaigns,
    campaignsCount: campaignsData?.totalCount || 0,
    campaignsSource: campaignsData?.source,
    isLoadingCampaigns,
    campaignsError,
    syncCampaignsMutation,
    loadCampaigns: refetchCampaigns,
    
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
    
    logs: logsData?.logs,
    logsCount: logsData?.totalCount || 0,
    isLoadingLogs,
    logsError,
    loadLogs: refetchLogs
  };
}
