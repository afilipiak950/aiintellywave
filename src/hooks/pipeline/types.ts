
import { PipelineProject, PipelineStage } from '../../types/pipeline';

export interface PipelineState {
  projects: PipelineProject[];
  stages: PipelineStage[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterCompanyId: string | null;
  isRefreshing: boolean;
  lastRefreshTime: Date;
}

export interface PipelineHookReturn extends PipelineState {
  setSearchTerm: (term: string) => void;
  setFilterCompanyId: (id: string | null) => void;
  updateProjectStage: (projectId: string, newStageId: string) => Promise<void>;
  refetch: () => Promise<void>;
}
