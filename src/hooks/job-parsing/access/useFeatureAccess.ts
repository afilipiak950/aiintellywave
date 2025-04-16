
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
        
        // Try to get the company ID with caching to reduce DB calls
        const companyId = await getUserCompanyId(userId);
        
        // Always allow access regardless of company settings
        setUserCompanyId(companyId);
        setHasAccess(true); // Always grant access to all users
        setIsAccessLoading(false);
        
        console.log(`Feature access granted with company ID: ${companyId || 'guest'}`);
      } catch (error) {
        console.error('Error checking feature access:', error);
        // For development/testing purposes, still allow access on error
        setUserCompanyId('guest');
        setHasAccess(true);
        setIsAccessLoading(false);
      }
    };
    
    if (userId && !accessCheckedRef.current) {
      console.log(`[FeatureAccess] Checking access for user: ${userId}`);
      checkAccess();
    } else if (!userId) {
      setIsAccessLoading(false);
    }
  }, [userId, getUserCompanyId]);
  
  return { hasAccess, isAccessLoading, userCompanyId };
};
