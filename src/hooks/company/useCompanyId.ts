
import { useState, useEffect } from 'react';
import { getUserCompanyId } from '@/utils/auth-utils';

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Use the existing auth util function
        const id = await getUserCompanyId();
        
        // Validate UUID format for extra safety
        if (id && id !== 'guest-search') {
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidPattern.test(id)) {
            console.error('Invalid company ID format returned:', id);
            setError('Ungültiges Firmen-ID Format');
            setCompanyId('guest-search');
            return;
          }
        }
        
        setCompanyId(id || 'guest-search');
      } catch (error) {
        console.error('Error fetching company ID:', error);
        setError('Fehler beim Abrufen der Firmen-ID');
        setCompanyId('guest-search'); // Fallback to guest mode
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await getUserCompanyId();
      
      // Validate UUID format for extra safety
      if (id && id !== 'guest-search') {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(id)) {
          console.error('Invalid company ID format returned:', id);
          setError('Ungültiges Firmen-ID Format');
          setCompanyId('guest-search');
          return;
        }
      }
      
      setCompanyId(id || 'guest-search');
    } catch (error) {
      console.error('Error refetching company ID:', error);
      setError('Fehler beim erneuten Abrufen der Firmen-ID');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    companyId, 
    isLoading,
    error,
    refetch
  };
};
