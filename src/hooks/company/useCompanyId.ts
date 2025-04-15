
import { useState, useEffect } from 'react';
import { getUserCompanyId } from '@/utils/auth-utils';

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        // Use the existing auth util function
        const id = await getUserCompanyId();
        setCompanyId(id || 'guest-search');
      } catch (error) {
        console.error('Error fetching company ID:', error);
        setCompanyId('guest-search'); // Fallback to guest mode
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  return { 
    companyId, 
    isLoading,
    refetch: async () => {
      setIsLoading(true);
      try {
        const id = await getUserCompanyId();
        setCompanyId(id || 'guest-search');
      } finally {
        setIsLoading(false);
      }
    }
  };
};
