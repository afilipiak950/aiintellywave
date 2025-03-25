
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
}

export const useManagerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchProjects();
  }, [user]);
  
  const fetchProjects = async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      
      // Get company projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          companies:company_id(name)
        `)
        .eq('company_id', user.companyId)
        .order('created_at', { ascending: false });
        
      if (projectsError) throw projectsError;
      
      if (projectsData) {
        const formattedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status,
          company: project.companies?.name || 'Unknown Company',
          start_date: project.start_date,
          end_date: project.end_date,
          progress: getProgressByStatus(project.status),
        }));
        
        setProjects(formattedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to calculate progress based on status
  const getProgressByStatus = (status: string): number => {
    switch (status) {
      case 'planning': return 10;
      case 'in_progress': return 50;
      case 'review': return 80;
      case 'completed': return 100;
      case 'canceled': return 0;
      default: return 0;
    }
  };
  
  // Filter and search projects
  const filteredProjects = projects
    .filter(project => 
      filter === 'all' || 
      (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
      (filter === 'completed' && project.status === 'completed') ||
      (filter === 'canceled' && project.status === 'canceled')
    )
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return {
    projects: filteredProjects,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    fetchProjects
  };
};
