
export const getProgressByStatus = (status: string): number => {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    default: return 0;
  }
};

export const mapProjectStatus = (status: string): string => {
  switch(status) {
    case 'planning': return 'project_start';
    case 'in_progress': return 'candidates_found';
    case 'review': return 'final_review';
    case 'completed': return 'completed';
    default: return 'project_start';
  }
};
