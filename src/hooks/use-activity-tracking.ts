
import { useAuth } from '@/context/auth';
import { useCallback } from 'react';
import { ActivityActions, ActivityData, ActivityTypes, trackUserActivity } from '@/services/activity-service';

export const useActivityTracking = () => {
  const { user } = useAuth();
  
  const trackActivity = useCallback((activityData: ActivityData) => {
    return trackUserActivity(user?.id, activityData);
  }, [user?.id]);
  
  return {
    trackActivity,
    ActivityTypes,
    ActivityActions
  };
};

export default useActivityTracking;
