
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

// Function to fetch projects outside the hook for better reuse
const fetchCompanyProjects = async (companyId: string | null, userId: string | null) => {
  if (!companyId) {
    console.warn('[fetchCompanyProjects] No company ID provided, cannot fetch projects');
    throw new Error('No company ID provided');
  }

  try {
    console.log(`[fetchCompanyProjects] Fetching projects for company: ${companyId}`);
    
    // Verify that the user belongs to this company (or is admin)
    if (userId) {
      console.log(`[fetchCompanyProjects] Verifying user ${userId} belongs to company ${companyId}`);
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('company_users')
        .select('company_id, user_id, is_admin')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle();
        
      if (userCompanyError) {
        console.error('[fetchCompanyProjects] Error verifying company access:', userCompanyError);
        throw new Error(`Access verification failed: ${userCompanyError.message}`);
      }
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      // If user is not admin and not part of this company, deny access
      if (userData && !userData.is_admin && !userCompany) {
        console.warn(`[fetchCompanyProjects] User ${userId} does not have access to company ${companyId}`);
        throw new Error('You do not have access to projects for this company');
      }
    }
    
    // Get projects for this specific company
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId);
      
    if (projectsError) {
      console.error('[fetchCompanyProjects] Error fetching projects:', projectsError);
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }
    
    if (!projectsData) {
      console.log('[fetchCompanyProjects] No projects found for company:', companyId);
      return [];
    }
    
    console.log(`[fetchCompanyProjects] Found ${projectsData.length} projects for company: ${companyId}`);
    
    // Calculate progress for each project
    const processedProjects = projectsData.map(project => {
      let progress = 0;
      
      if (project.status === 'completed') {
        progress = 100;
      } else if (project.status === 'in_progress') {
        progress = 50;
      } else if (project.status === 'planning') {
        progress = 10;
      }
      
      return {
        ...project,
        progress
      };
    });
    
    return processedProjects;
  } catch (err: any) {
    console.error('[fetchCompanyProjects] Error:', err);
    throw err;
  }
};

// Set up realtime subscription for projects
export const setupProjectSubscription = (
  companyId: string | null,
  queryClient: any
) => {
  if (!companyId) return () => {};
  
  console.log(`[setupProjectSubscription] Setting up realtime subscription for company: ${companyId}`);
  
  const channel = supabase.channel(`public:projects:company_id=eq.${companyId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'projects',
      filter: `company_id=eq.${companyId}`
    }, (payload) => {
      console.log('[setupProjectSubscription] Received project update:', payload);
      
      // Invalidate and refetch projects query
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] });
    })
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        console.log('[setupProjectSubscription] Successfully subscribed to project changes');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[setupProjectSubscription] Failed to subscribe to project changes');
        toast({
          title: 'Realtime Connection Error',
          description: 'Could not establish realtime connection for projects. Some updates may be delayed.',
          variant: 'destructive'
        });
      }
    });
    
  // Return cleanup function
  return () => {
    console.log('[setupProjectSubscription] Cleaning up project subscription');
    supabase.removeChannel(channel);
  };
};

export const useCompanyAllProjects = (companyId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use React Query for data fetching with caching
  const {
    data: projects = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects', companyId],
    queryFn: () => fetchCompanyProjects(companyId, user?.id || null),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
  });

  // Set up realtime subscription
  useEffect(() => {
    const cleanup = setupProjectSubscription(companyId, queryClient);
    return cleanup;
  }, [companyId, queryClient]);

  // Format the error message for consistent UI handling
  const errorMsg = error instanceof Error ? error.message : 'Failed to load projects';

  return { 
    projects, 
    loading, 
    error: error ? errorMsg : null,
    refetch 
  };
};
