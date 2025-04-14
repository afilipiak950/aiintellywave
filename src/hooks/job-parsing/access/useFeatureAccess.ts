
import { useEffect, useState } from 'react';
import { useJobSearchApi } from '../api/useJobSearchApi';

export const useFeatureAccess = (userId: string | null) => {
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const { getUserCompanyId } = useJobSearchApi(userCompanyId, userId);

  // Always enable access for all users
  useEffect(() => {
    const checkAccess = async () => {
      if (!userId) {
        console.log('No user ID provided, but granting access anyway');
        setIsAccessLoading(false);
        return;
      }
      
      setIsAccessLoading(true);
      try {
        console.log(`Checking job parsing feature access for user: ${userId}`);
        
        // Get user's company ID for other functionality
        const companyId = await getUserCompanyId(userId);
        console.log(`User company ID: ${companyId}`);
        setUserCompanyId(companyId);
        
      } catch (error) {
        console.error('Error checking feature access:', error);
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    checkAccess();
  }, [userId, getUserCompanyId]);

  return {
    hasAccess: true, // Always return true to grant access to all users
    isAccessLoading,
    userCompanyId
  };
};
