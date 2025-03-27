import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { Project, fetchManagerProjects } from '../services/manager-project-service';
import { filterProjects } from '../utils/project-status';

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
    setLoading(true);
    
    try {
      const projectsData = await fetchManagerProjects(user?.companyId);
      setProjects(projectsData);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and search projects
  const filteredProjects = filterProjects(projects, filter, searchTerm);

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
