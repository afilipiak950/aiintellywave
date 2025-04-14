
import { useEffect, useState, useRef } from 'react';
import { useCompanyIdResolver } from '../api/useCompanyIdResolver';

export const useFeatureAccess = (userId: string | undefined) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isAccessLoading, setIsAccessLoading] = useState<boolean>(true);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const { getUserCompanyId } = useCompanyIdResolver();
  const accessCheckedRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Only check access once per component lifecycle
    if (accessCheckedRef.current) {
      return;
    }
    
    const checkAccess = async () => {
      if (!userId) {
        setIsAccessLoading(false);
        setHasAccess(false);
        return;
      }
      
      try {
        setIsAccessLoading(true);
        accessCheckedRef.current = true;
        
        // Try to get the company ID
        const companyId = await getUserCompanyId(userId);
        
        // If we have a valid company ID, set it and grant access
        if (companyId) {
          setUserCompanyId(companyId);
          setHasAccess(true);
        } else {
          // Allow guest access for testing when companyId is null
          console.log('No company ID found, using guest access mode');
          setUserCompanyId('guest');
          setHasAccess(true); // Still allow access in guest mode
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        // For development/testing purposes, still allow access on error
        setUserCompanyId('guest');
        setHasAccess(true);
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    // Only check once per user ID
    if (userId) {
      checkAccess();
    }
  }, [userId, getUserCompanyId]);
  
  return { hasAccess, isAccessLoading, userCompanyId };
};
