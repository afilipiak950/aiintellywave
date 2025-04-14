
import { useEffect, useState } from 'react';
import { isJobParsingEnabled } from '@/hooks/use-feature-access';
import { useJobSearchApi } from '../api/useJobSearchApi';
import { toast } from '@/hooks/use-toast';

export const useFeatureAccess = (userId: string | null) => {
  const [hasAccess, setHasAccess] = useState(true); // Default to true to always grant access
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const { getUserCompanyId } = useJobSearchApi(userCompanyId, userId);

  // Force enable access for all users
  useEffect(() => {
    const checkAccess = async () => {
      if (!userId) {
        console.log('No user ID provided, but granting access anyway');
        setHasAccess(true);
        setIsAccessLoading(false);
        return;
      }
      
      setIsAccessLoading(true);
      try {
        console.log(`Checking job parsing feature access for user: ${userId}`);
        
        // Always grant access but still get the company ID
        setHasAccess(true);
        
        // Get user's company ID for other functionality
        const companyId = await getUserCompanyId(userId);
        console.log(`User company ID: ${companyId}`);
        setUserCompanyId(companyId);
        
        // Show notification that access is granted
        toast({
          title: "Google Jobs Feature",
          description: "Jobangebote feature is now enabled for your account",
          variant: "default"
        });
        
      } catch (error) {
        console.error('Error checking feature access:', error);
        // Still grant access even if there's an error
        setHasAccess(true);
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    checkAccess();
  }, [userId]);

  return {
    hasAccess: true, // Always return true to grant access to all users
    isAccessLoading,
    userCompanyId
  };
};
