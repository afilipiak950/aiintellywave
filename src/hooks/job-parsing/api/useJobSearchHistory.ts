
import { useState, useEffect } from 'react';
import { useSearchHistoryOperations } from './useSearchHistoryOperations';
import { useAuth } from '@/context/auth';
import { JobSearchHistory } from '@/types/job-parsing';

export const useJobSearchHistory = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<JobSearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { loadSearchHistory, deleteSearch } = useSearchHistoryOperations(user?.companyId || null);

  const fetchSearchHistory = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const history = await loadSearchHistory(user.id, user.companyId || null);
      setSearchHistory(history);
    } catch (err) {
      console.error('Error loading search history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      const success = await deleteSearch(id);
      if (success) {
        await fetchSearchHistory();
      }
    } catch (err) {
      console.error('Error deleting search history:', err);
    }
  };

  // Load search history when user changes
  useEffect(() => {
    fetchSearchHistory();
  }, [user?.id, user?.companyId]);

  return { 
    searchHistory, 
    isLoading,
    loadSearchHistory: fetchSearchHistory,
    deleteSearch: handleDeleteSearch
  };
};
