
import { useState, useEffect } from 'react';
import { getUserCompanyId } from '@/utils/auth-utils';

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        setIsLoading(true);
        // Use the existing auth util function
        const id = await getUserCompanyId();
        
        // Validate UUID format for extra safety
        if (id && id !== 'guest-search') {
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidPattern.test(id)) {
            console.error('Invalid company ID format returned:', id);
            setCompanyId('guest-search');
            return;
          }
        }
        
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
        
        // Validate UUID format for extra safety
        if (id && id !== 'guest-search') {
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidPattern.test(id)) {
            console.error('Invalid company ID format returned:', id);
            setCompanyId('guest-search');
            return;
          }
        }
        
        setCompanyId(id || 'guest-search');
      } finally {
        setIsLoading(false);
      }
    }
  };
};
