
import { useState, useMemo } from 'react';
import { CustomerProject } from './use-customer-projects';

export const useProjectFilters = (projects: CustomerProject[] = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredProjects = useMemo(() => 
    projects.filter(project => 
      (filter === 'all' || 
      (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
      (filter === 'completed' && project.status === 'completed') ||
      (filter === 'canceled' && project.status === 'canceled')) &&
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [projects, filter, searchTerm]
  );

  return {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    filteredProjects
  };
};
