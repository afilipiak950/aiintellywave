
import { useEffect, useCallback, useState } from 'react';
import { Lead } from '@/types/lead';
import { useAuth } from '@/context/auth';
import { useLeadOperations } from './use-lead-operations';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseLeadQueryOptions {
  projectId?: string;
  status?: Lead['status'];
  assignedToUser?: boolean;
  limit?: number;
}

/**
 * Hook for querying leads data based on provided options
 */
export const useLeadQuery = (
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  options: UseLeadQueryOptions = {}
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeadOperations(setLeads, setLoading);

  // Calculate backoff time based on retry count (exponential backoff)
  const getBackoffTime = (retry: number): number => {
    // Start with 1 second, then double each retry (1s, 2s, 4s, 8s...)
    const backoff = Math.min(30000, Math.pow(2, retry) * 1000);
    // Add some randomness to prevent thundering herd problem
    return backoff + (Math.random() * 1000);
  };

  // Direct database check for projects to debug issues
  const checkProjectsDirectly = async () => {
    if (!user) return [];
    
    try {
      console.log('Performing direct DB check for user projects...');
      
      // Get the user's company
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (companyError) {
        console.error('Error fetching company:', companyError);
        
        // If we get an infinite recursion error, it's likely related to RLS policies
        if (companyError.message.includes('infinite recursion')) {
          // Try a more direct approach
          const { data: userRolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
            
          console.log('User roles:', userRolesData);
          
          // Let's try to use the edge function to check access
          try {
            const { data: rlsData } = await supabase.functions.invoke('check-rls');
            console.log('RLS check from edge function:', rlsData);
          } catch (err) {
            console.warn('Error checking RLS from edge function:', err);
          }
        }
        
        return [];
      }
      
      if (!companyData?.company_id) {
        console.warn('No company found for user');
        
        // Alternative: try to find if the user has any projects directly assigned
        const { data: userProjects } = await supabase
          .from('projects')
          .select('id, name')
          .eq('assigned_to', user.id);
          
        if (userProjects && userProjects.length > 0) {
          console.log('Found projects directly assigned to user:', userProjects);
          return userProjects;
        }
        
        return [];
      }
      
      // Get projects for the company
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', companyData.company_id);
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return [];
      }
      
      console.log(`Found ${projects.length} projects for company:`, projects);
      
      // Check if any projects have leads
      for (const project of projects) {
        const { data: projectLeads, error: leadsError } = await supabase
          .from('leads')
          .select('id')
          .eq('project_id', project.id)
          .limit(5);
          
        if (leadsError) {
          console.error(`Error checking leads for project ${project.id}:`, leadsError);
          continue;
        }
        
        console.log(`Project ${project.name} (${project.id}) has ${projectLeads.length} leads`);
      }
      
      return projects;
    } catch (error) {
      console.error('Error in direct project check:', error);
      
      // Try to use the edge function as a last resort
      try {
        const { data: checkResult } = await supabase.functions.invoke('check-rls');
        console.log('Edge function access check result:', checkResult);
      } catch (e) {
        console.error('Edge function error:', e);
      }
      
      return [];
    }
  };

  // Enhanced fetch with better project lead handling - exposed to parent
  const fetchProjectLeadsDirectly = async (projectId: string): Promise<Lead[]> => {
    console.log(`Directly fetching leads for project: ${projectId}`);
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          company,
          email,
          phone,
          position,
          status,
          notes,
          last_contact,
          created_at,
          updated_at,
          score,
          tags,
          project_id,
          extra_data
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(options.limit || 100);
      
      if (error) {
        console.error(`Error fetching leads for project ${projectId}:`, error);
        return [];
      }
      
      console.log(`Found ${data.length} leads for project ${projectId}`);
      
      // Process leads to include extra needed fields
      const processedLeads = data.map(lead => ({
        ...lead,
        project_name: 'Loading...',
        // Handle extra_data from DB to be a properly typed Record
        extra_data: lead.extra_data ? 
          (typeof lead.extra_data === 'string' ? 
            JSON.parse(lead.extra_data) : lead.extra_data) : 
          null,
        website: null
      } as Lead));
      
      // Get project name for these leads
      try {
        const { data: projectData } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .maybeSingle();
          
        if (projectData?.name) {
          return processedLeads.map(lead => ({
            ...lead,
            project_name: projectData.name
          }));
        }
      } catch (e) {
        console.warn('Error fetching project name:', e);
      }
      
      return processedLeads;
    } catch (error) {
      console.error(`Error in direct project leads fetch:`, error);
      
      // Last resort: try to get leads using the edge function
      try {
        console.log('Attempting to use edge function to fetch leads...');
        const { data: funcData } = await supabase.functions.invoke('check-rls');
        console.log('Edge function result:', funcData);
      } catch (e) {
        console.error('Edge function error:', e);
      }
      
      return [];
    }
  };

  // Initial fetch with better error handling and backoff strategy
  const initialFetch = useCallback(async () => {
    if (!user) {
      console.log('No authenticated user, skipping lead fetch');
      return;
    }
    
    // Prevent multiple retries running in parallel
    if (isRetrying) {
      return;
    }
    
    setIsRetrying(true);
    console.log('Initiating lead fetch with options:', options);
    
    try {
      // First, directly check projects to debug issues
      const projects = await checkProjectsDirectly();
      
      // Add limit parameter to the fetch options to optimize query
      const fetchOptions = {
        ...options,
        limit: options.limit || 100 // Default to 100 if not provided
      };
      
      // Try direct project lead fetch first if projectId is provided
      if (options.projectId && options.projectId !== 'all') {
        console.log(`Trying direct project lead fetch for: ${options.projectId}`);
        const projectLeads = await fetchProjectLeadsDirectly(options.projectId);
        
        if (projectLeads && projectLeads.length > 0) {
          console.log(`Found ${projectLeads.length} leads for project ${options.projectId}`);
          setLeads(projectLeads);
          setLastError(null);
          setRetryCount(0);
          setIsRetrying(false);
          return projectLeads;
        } else {
          console.log(`No leads found for project ${options.projectId}, falling back to regular fetch`);
        }
      }
      
      // Fallback to fetching from all company projects
      if (projects.length > 0 && (!options.projectId || options.projectId === 'all')) {
        console.log('Attempting to fetch leads from all company projects...');
        let allLeads: Lead[] = [];
        
        // Get leads from each project (limit to first 5 projects to avoid overloading)
        const projectsToCheck = projects.slice(0, 5);
        for (const project of projectsToCheck) {
          const projectLeads = await fetchProjectLeadsDirectly(project.id);
          if (projectLeads.length > 0) {
            allLeads = [...allLeads, ...projectLeads];
          }
        }
        
        if (allLeads.length > 0) {
          console.log(`Found ${allLeads.length} leads across all projects`);
          setLeads(allLeads);
          setLastError(null);
          setRetryCount(0);
          setIsRetrying(false);
          return allLeads;
        }
      }
      
      // If direct fetching didn't work, try the regular fetching path
      const leads = await fetchLeads(fetchOptions);
      console.log(`Regular fetch returned ${leads?.length || 0} leads`);
      setLastError(null);
      setRetryCount(0);
      setIsRetrying(false);
      return leads;
    } catch (err) {
      console.error('Error in initialFetch:', err);
      
      // Show a toast notification for the error
      toast({
        title: "Error loading leads",
        description: "There was a problem fetching lead data. Retrying...",
        variant: "destructive"
      });
      
      setLastError(err instanceof Error ? err : new Error(String(err)));
      
      // Increment retry count for exponential backoff
      setRetryCount(prev => prev + 1);
      
      // Schedule a retry with exponential backoff
      const backoffTime = getBackoffTime(retryCount);
      console.log(`Scheduling retry in ${backoffTime}ms (retry #${retryCount + 1})`);
      
      // Don't automatically retry more than 5 times
      if (retryCount < 5) {
        setTimeout(() => {
          setIsRetrying(false);
          initialFetch();
        }, backoffTime);
      } else {
        // After 5 retries, stop automatic retrying
        setIsRetrying(false);
      }
      
      return null;
    } finally {
      if (retryCount >= 5) {
        setIsRetrying(false);
      }
    }
  }, [user, options, fetchLeads, retryCount, isRetrying, setLeads, checkProjectsDirectly]);

  // Manual retry function that resets the retry counter
  const manualRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    return initialFetch();
  }, [initialFetch]);

  // Initial fetch effect - runs only when dependencies change
  useEffect(() => {
    // Check if we already have cached data before fetching
    const cachedLeads = queryClient.getQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id]);
    
    if (!cachedLeads && !isRetrying) {
      initialFetch();
    }
    
    // Cleanup function to ensure we don't have pending retries when component unmounts
    return () => {
      setIsRetrying(false);
    };
  }, [initialFetch, queryClient, options.projectId, options.status, options.assignedToUser, user?.id, isRetrying]);

  // Enhanced operations that update React Query cache
  const enhancedCreate = async (leadData: Partial<Lead>) => {
    // Ensure we have a name field even if it's empty string
    const leadWithName = {
      ...leadData,
      name: leadData.name || '',
      status: leadData.status || 'new' // Make sure status is always provided
    } as Omit<Lead, "created_at" | "id" | "updated_at">;
    
    const newLead = await createLead(leadWithName);
    // Update React Query cache
    queryClient.setQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id], 
      (oldData: Lead[] | undefined) => oldData ? [newLead, ...oldData] : [newLead]);
    return newLead;
  };
  
  const enhancedUpdate = async (leadId: string, leadData: Partial<Lead>) => {
    const updatedLead = await updateLead(leadId, leadData);
    // Update React Query cache
    queryClient.setQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id], 
      (oldData: Lead[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(lead => lead.id === leadId ? updatedLead : lead);
      });
    return updatedLead;
  };
  
  const enhancedDelete = async (leadId: string) => {
    await deleteLead(leadId);
    // Update React Query cache
    queryClient.setQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id], 
      (oldData: Lead[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(lead => lead.id !== leadId);
      });
  };

  return {
    fetchLeads: () => fetchLeads(options),
    createLead: enhancedCreate,
    updateLead: enhancedUpdate,
    deleteLead: enhancedDelete,
    manualRetry,
    lastError,
    retryCount,
    isRetrying,
    checkProjectsDirectly,
    fetchProjectLeadsDirectly // Expose this function to parent
  };
};
