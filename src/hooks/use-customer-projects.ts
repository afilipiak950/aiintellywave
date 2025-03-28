
import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { Project, fetchCustomerProjects } from '../services/project-service';
import { filterAndSearchProjects } from '../utils/project-utils';
import { toast } from "../hooks/use-toast";

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.companyId) {
        console.warn('No company ID available for fetching projects');
        setProjects([]);
        setLoading(false);
        return;
      }
      
      console.log('Fetching projects for company ID:', user.companyId);
      const data = await fetchCustomerProjects(user.companyId);
      setProjects(data);
    } catch (err: any) {
      console.error('Error fetching customer projects:', err);
      setError(err.message || 'Failed to load projects');
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search projects
  const filteredProjects = filterAndSearchProjects(projects, filter, searchTerm);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects: filteredProjects,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    fetchProjects
  };
};
