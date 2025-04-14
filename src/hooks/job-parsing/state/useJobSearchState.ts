
import { useState } from 'react';
import { Job, JobOfferRecord } from '@/types/job-parsing';

export interface SearchParams {
  query: string;
  location: string;
  experience?: string;
  industry?: string;
  maxResults?: number;
}

export const useJobSearchState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    location: '',
    experience: 'any', // Default value to avoid empty string
    maxResults: 50 // Default max results
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchHistory, setSearchHistory] = useState<JobOfferRecord[]>([]);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] = useState(false);
  const [hasAccess, setHasAccess] = useState(true); // Default to true for testing
  const [isAccessLoading, setIsAccessLoading] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (param: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [param]: value }));
  };

  return {
    // State
    isLoading,
    setIsLoading,
    jobs,
    setJobs,
    searchParams,
    setSearchParams,
    selectedJob,
    setSelectedJob,
    searchHistory,
    setSearchHistory,
    isSearchHistoryOpen,
    setIsSearchHistoryOpen,
    aiSuggestion,
    setAiSuggestion,
    isAiModalOpen,
    setIsAiModalOpen,
    isGeneratingAiSuggestion,
    setIsGeneratingAiSuggestion,
    hasAccess,
    setHasAccess,
    isAccessLoading,
    setIsAccessLoading,
    userCompanyId,
    setUserCompanyId,
    error,
    setError,
    // Handlers
    handleParamChange
  };
};
