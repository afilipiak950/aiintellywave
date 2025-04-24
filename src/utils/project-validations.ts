
export const VALID_PROJECT_STATUSES = ['planning', 'in_progress', 'review', 'completed', 'cancelled'] as const;
export type ProjectStatus = typeof VALID_PROJECT_STATUSES[number];

export const isValidProjectStatus = (status: string): status is ProjectStatus => {
  return VALID_PROJECT_STATUSES.includes(status as ProjectStatus);
};

export const getDefaultStatus = (): ProjectStatus => 'in_progress';

export const getStatusLabel = (status: ProjectStatus): string => {
  const statusLabels: Record<ProjectStatus, string> = {
    'planning': 'Planung',
    'in_progress': 'In Bearbeitung',
    'review': 'Prüfung',
    'completed': 'Abgeschlossen',
    'cancelled': 'Abgebrochen'
  };
  
  return statusLabels[status] || status;
};
