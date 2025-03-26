
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

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchProjects = async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      console.log('Fetching customer projects for company:', user.companyId);
      
      // Simplified query to avoid RLS issues
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, status, start_date, end_date')
        .eq('company_id', user.companyId);
        
      if (projectsError) {
        console.error('Error fetching customer projects:', projectsError);
        throw projectsError;
      }
      
      console.log('Customer projects received:', projectsData);
      
      if (projectsData) {
        // Get company name in a separate query
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name')
          .eq('id', user.companyId)
          .maybeSingle();
          
        const companyName = companyError ? 'Unknown Company' : companyData?.name || 'Unknown Company';
        
        const formattedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status,
          company: companyName,
          start_date: project.start_date,
          end_date: project.end_date,
          progress: getProgressByStatus(project.status),
        }));
        
        setProjects(formattedProjects);
      }
    } catch (error) {
      console.error('Error fetching customer projects:', error);
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
      (filter === 'completed' && project.status === 'completed')
    )
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  useEffect(() => {
    fetchProjects();
  }, [user]);

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
