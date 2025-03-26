
// Utility functions for project status operations

/**
 * Calculate progress percentage based on project status
 */
export const getProgressByStatus = (status: string): number => {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    case 'canceled': return 0;
    default: return 0;
  }
};

/**
 * Filter projects based on filter criteria and search term
 */
export const filterProjects = (
  projects: any[],
  filter: string,
  searchTerm: string
): any[] => {
  return projects
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
};
