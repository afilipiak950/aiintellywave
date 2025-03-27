
export type PipelineStage = {
  id: string;
  name: string;
  order: number;
  color?: string;
};

export type PipelineProject = {
  id: string;
  name: string;
  description: string;
  stageId: string;
  company: string;
  company_id: string;
  updated_at: string;
  status: string;
  progress: number;
  color?: string;
  hasUpdates?: boolean;
};

export type PipelineProps = {
  stages: PipelineStage[];
  projects: PipelineProject[];
  onStageChange: (projectId: string, newStageId: string) => void;
};

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: 'project_start', name: 'Project Start', order: 1, color: 'bg-indigo-500' },
  { id: 'candidates_found', name: 'Candidates Found', order: 2, color: 'bg-blue-500' },
  { id: 'contact_made', name: 'Contact Made', order: 3, color: 'bg-cyan-500' },
  { id: 'interviews_scheduled', name: 'Interviews Scheduled', order: 4, color: 'bg-green-500' },
  { id: 'final_review', name: 'Final Review', order: 5, color: 'bg-amber-500' },
  { id: 'completed', name: 'Completed', order: 6, color: 'bg-emerald-500' }
];
