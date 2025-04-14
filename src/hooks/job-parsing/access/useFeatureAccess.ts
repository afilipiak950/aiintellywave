
import { useEffect, useState } from 'react';
import { isJobParsingEnabled } from '@/hooks/use-feature-access';
import { useJobSearchApi } from '../api/useJobSearchApi';

export const useFeatureAccess = (userId: string | null) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const { getUserCompanyId } = useJobSearchApi(userCompanyId, userId);

  useEffect(() => {
    const checkAccess = async () => {
      if (!userId) {
        setIsAccessLoading(false);
        return;
      }
      
      setIsAccessLoading(true);
      try {
        // Check feature access
        const hasFeatureAccess = await isJobParsingEnabled(userId);
        setHasAccess(hasFeatureAccess);
        
        if (!hasFeatureAccess) {
          console.log('User does not have access to job parsing feature');
        }

        // Get user's company ID
        const companyId = await getUserCompanyId(userId);
        setUserCompanyId(companyId);
        
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    checkAccess();
  }, [userId]);

  return {
    hasAccess,
    isAccessLoading,
    userCompanyId
  };
};
