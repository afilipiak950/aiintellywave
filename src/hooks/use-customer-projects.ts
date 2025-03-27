import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { Project, fetchCustomerProjects } from '../services/project-service';
import { filterAndSearchProjects } from '../utils/project-utils';

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchProjects = async () => {
    setLoading(true);
    const data = await fetchCustomerProjects(user?.companyId);
    setProjects(data);
    setLoading(false);
  };

  // Filter and search projects
  const filteredProjects = filterAndSearchProjects(projects, filter, searchTerm);

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
