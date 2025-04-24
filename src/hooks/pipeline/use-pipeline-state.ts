
import { useState, useCallback } from 'react';
import { PipelineState } from './types';
import { DEFAULT_PIPELINE_STAGES } from '../../types/pipeline';

export const usePipelineState = () => {
  const [state, setState] = useState<PipelineState>({
    projects: [],
    stages: DEFAULT_PIPELINE_STAGES,
    loading: true,
    searchTerm: '',
    filterCompanyId: null,
    isRefreshing: false,
    lastRefreshTime: new Date(),
    error: null
  });

  const updateState = useCallback((updates: Partial<PipelineState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    state,
    updateState
  };
};
