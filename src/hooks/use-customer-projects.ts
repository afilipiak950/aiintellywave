import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { toast } from '../hooks/use-toast';
import { getProgressByStatus } from '../utils/project-utils';

export interface CustomerProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
}

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isFallbackData, setIsFallbackData] = useState(false);
  
  useEffect(() => {
    try {
      const cachedProjects = localStorage.getItem('dashboard_projects');
      if (cachedProjects) {
        const parsedProjects = JSON.parse(cachedProjects);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          console.log('Loaded cached projects from localStorage:', parsedProjects.length);
          setProjects(parsedProjects);
          setIsFallbackData(true);
        }
      }
    } catch (err) {
      console.warn('Failed to load cached projects:', err);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !isFallbackData) {
      try {
        localStorage.setItem('dashboard_projects', JSON.stringify(projects));
        console.log('Saved projects to localStorage:', projects.length);
      } catch (err) {
        console.warn('Failed to cache projects:', err);
      }
    }
  }, [projects, isFallbackData]);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const now = Date.now();
      if (now - lastFetchTime < 2000 && retryCount > 0) {
        console.log('Throttling fetch requests, trying again in 2 seconds...');
        setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        return;
      }
      
      setLastFetchTime(now);
      setLoading(true);
      setIsFallbackData(false);
      
      console.log('Fetching customer projects for user:', user.id);
      
      let allProjects: any[] = [];
      let fetchErrors: string[] = [];
      let successPaths: string[] = [];
      
      try {
        console.log('Attempting to fetch projects using RPC function');
        const { data: companyIds } = await supabase.rpc('get_user_company_ids', {
          user_uuid: user.id
        });
        
        if (companyIds && companyIds.length > 0) {
          successPaths.push('rpc:company_ids');
          console.log('Found company IDs via RPC:', companyIds);
          
          for (const companyId of companyIds) {
            const { data: companyProjects, error: projectsError } = await supabase
              .from('projects')
              .select('*')
              .eq('company_id', companyId);
              
            if (projectsError) {
              console.warn('Error fetching company projects:', projectsError);
              fetchErrors.push(`Company projects (${companyId}): ${projectsError.message}`);
            } else if (companyProjects && companyProjects.length > 0) {
              successPaths.push(`company:${companyId}`);
              console.log(`Found ${companyProjects.length} projects for company ${companyId}`);
              allProjects = [...allProjects, ...companyProjects];
            }
          }
        } else {
          console.log('No company IDs found via RPC');
        }
      } catch (rpcError: any) {
        console.warn('Error using RPC method:', rpcError);
        fetchErrors.push(`RPC method: ${rpcError.message}`);
      }
      
      try {
        console.log('Attempting to fetch projects directly assigned to user');
        const { data: directProjects, error: directError } = await supabase
          .from('projects')
          .select('*')
          .eq('assigned_to', user.id);
          
        if (directError) {
          console.warn('Error fetching direct projects:', directError);
          fetchErrors.push(`Direct projects: ${directError.message}`);
        } else if (directProjects && directProjects.length > 0) {
          successPaths.push('direct:assigned_to');
          console.log('Found directly assigned projects:', directProjects.length);
          
          const existingIds = new Set(allProjects.map(p => p.id));
          const newProjects = directProjects.filter(p => !existingIds.has(p.id));
          allProjects = [...allProjects, ...newProjects];
        }
      } catch (directError: any) {
        console.warn('Exception fetching direct projects:', directError);
        fetchErrors.push(`Direct projects exception: ${directError.message}`);
      }
      
      if (allProjects.length === 0 && user.user_metadata?.company_id) {
        try {
          const companyId = user.user_metadata.company_id;
          console.log('Trying to fetch projects using company_id from user metadata:', companyId);
          
          const { data: metadataProjects, error: metadataError } = await supabase
            .from('projects')
            .select('*')
            .eq('company_id', companyId);
            
          if (metadataError) {
            console.warn('Error fetching metadata company projects:', metadataError);
            fetchErrors.push(`Metadata company projects: ${metadataError.message}`);
          } else if (metadataProjects && metadataProjects.length > 0) {
            successPaths.push('metadata:company_id');
            console.log('Found projects using company_id from metadata:', metadataProjects.length);
            allProjects = [...allProjects, ...metadataProjects];
          }
        } catch (metadataError: any) {
          console.warn('Exception fetching metadata company projects:', metadataError);
          fetchErrors.push(`Metadata company projects exception: ${metadataError.message}`);
        }
      }
      
      if (allProjects.length === 0) {
        try {
          console.log('Attempting fallback: fetch recent projects');
          const { data: recentProjects, error: recentError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
          if (recentError) {
            console.warn('Error in fallback fetch:', recentError);
            fetchErrors.push(`Fallback: ${recentError.message}`);
          } else if (recentProjects && recentProjects.length > 0) {
            successPaths.push('fallback:recent');
            console.log('Fallback successful, found recent projects:', recentProjects.length);
            allProjects = [...allProjects, ...recentProjects];
          }
        } catch (fallbackError: any) {
          console.warn('Exception in fallback fetch:', fallbackError);
          fetchErrors.push(`Fallback exception: ${fallbackError.message}`);
        }
      }
      
      const uniqueProjects = Array.from(
        new Map(allProjects.map(item => [item.id, item])).values()
      );
      
      if (uniqueProjects.length > 0) {
        const formattedProjects = uniqueProjects.map(project => ({
          id: project.id,
          name: project.name || 'Unbenanntes Projekt',
          description: project.description || '',
          status: project.status || 'planning',
          progress: getProgressByStatus(project.status)
        }));
        
        console.log('Total projects found after deduplication:', formattedProjects.length);
        console.log('Project names:', formattedProjects.map(p => p.name));
        console.log('Success paths:', successPaths);
        
        setProjects(formattedProjects);
        setIsFallbackData(false);
        setError(null);
      } else if (fetchErrors.length > 0) {
        console.error('No projects found, encountered errors:', fetchErrors);
        
        let mainError = fetchErrors.find(e => e.includes('RLS policy')) || 
                        fetchErrors.find(e => e.includes('infinite recursion')) ||
                        fetchErrors[0] ||
                        'Failed to load projects';
                        
        if (projects.length > 0) {
          console.log('Using cached projects due to fetch error');
          setIsFallbackData(true);
          toast({
            title: "Achtung",
            description: "Die Projekte konnten nicht aktualisiert werden. Verwende zwischengespeicherte Daten.",
            variant: "warning"
          });
        } else {
          setError(mainError);
          toast({
            title: "Fehler",
            description: "Projekte konnten nicht geladen werden.",
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('Error in useCustomerProjects:', error);
      
      setError(error.message || 'Failed to load projects');
      
      if (projects.length === 0) {
        toast({
          title: "Fehler",
          description: "Projekte konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
          variant: "destructive"
        });
      } else {
        setIsFallbackData(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user, retryCount, lastFetchTime, projects.length]);

  const retryFetchProjects = useCallback(() => {
    setRetryCount(prevCount => prevCount + 1);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { 
    projects, 
    loading, 
    error, 
    fetchProjects, 
    retryFetchProjects, 
    isFallbackData 
  };
};
