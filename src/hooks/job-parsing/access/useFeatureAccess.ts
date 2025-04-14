
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
        console.log('No user ID provided, access denied');
        setHasAccess(false);
        setIsAccessLoading(false);
        return;
      }
      
      setIsAccessLoading(true);
      try {
        console.log(`Checking job parsing feature access for user: ${userId}`);
        
        // Check feature access
        const hasFeatureAccess = await isJobParsingEnabled(userId);
        console.log(`Job parsing feature enabled: ${hasFeatureAccess}`);
        setHasAccess(hasFeatureAccess);
        
        if (!hasFeatureAccess) {
          console.log('User does not have access to job parsing feature');
        }

        // Get user's company ID
        const companyId = await getUserCompanyId(userId);
        console.log(`User company ID: ${companyId}`);
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

  // Re-check access when userId changes
  useEffect(() => {
    if (userId) {
      console.log('User ID changed, rechecking feature access');
      setIsAccessLoading(true);
      isJobParsingEnabled(userId)
        .then(access => {
          console.log(`Feature access rechecked: ${access}`);
          setHasAccess(access);
        })
        .catch(error => {
          console.error('Error rechecking feature access:', error);
          setHasAccess(false);
        })
        .finally(() => {
          setIsAccessLoading(false);
        });
    }
  }, [userId]);

  return {
    hasAccess,
    isAccessLoading,
    userCompanyId
  };
};
