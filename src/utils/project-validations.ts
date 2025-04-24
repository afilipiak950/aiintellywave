
export const VALID_PROJECT_STATUSES = ['in_progress', 'completed', 'cancelled'] as const;
export type ProjectStatus = typeof VALID_PROJECT_STATUSES[number];

export const isValidProjectStatus = (status: string): status is ProjectStatus => {
  return VALID_PROJECT_STATUSES.includes(status as ProjectStatus);
};

export const getDefaultStatus = (): ProjectStatus => 'in_progress';
