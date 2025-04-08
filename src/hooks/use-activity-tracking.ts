
import { useAuth } from '@/context/auth';
import { useCallback } from 'react';
import { ActivityActions, ActivityData, ActivityTypes, trackUserActivity } from '@/services/activity-service';
import { toast } from '@/hooks/use-toast';

export const useActivityTracking = () => {
  const { user } = useAuth();
  
  const trackActivity = useCallback(async (activityData: ActivityData) => {
    const success = await trackUserActivity(user?.id, activityData);
    if (!success) {
      console.error('Failed to track activity:', activityData);
    }
    return success;
  }, [user?.id]);
  
  // Helper function to log a basic activity with minimal parameters
  const logActivity = useCallback(async (
    entityType: string, 
    entityId: string, 
    action: string, 
    message?: string,
    details?: Record<string, any>
  ) => {
    try {
      const activityData: ActivityData = {
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        details: { 
          message,
          ...details
        }
      };
      
      return await trackActivity(activityData);
    } catch (err) {
      console.error('Error logging activity:', err);
      return false;
    }
  }, [trackActivity]);
  
  // Predefined helper methods for common activities
  const logProjectActivity = useCallback((projectId: string, action: string, message?: string, details?: Record<string, any>) => {
    return logActivity(ActivityTypes.PROJECT, projectId, action, message, details);
  }, [logActivity]);
  
  const logLeadActivity = useCallback((leadId: string, action: string, message?: string, details?: Record<string, any>) => {
    return logActivity(ActivityTypes.LEAD, leadId, action, message, details);
  }, [logActivity]);
  
  const logSettingsActivity = useCallback((settingsId: string, action: string, message?: string, details?: Record<string, any>) => {
    return logActivity(ActivityTypes.SETTING, settingsId, action, message, details);
  }, [logActivity]);
  
  const logUserActivity = useCallback((targetUserId: string, action: string, message?: string, details?: Record<string, any>) => {
    return logActivity(ActivityTypes.USER, targetUserId, action, message, details);
  }, [logActivity]);
  
  const logProfileUpdate = useCallback((changes: Record<string, any>) => {
    return logActivity(
      ActivityTypes.USER, 
      user?.id || 'unknown', 
      ActivityActions.USER_UPDATED_PROFILE,
      "Updated profile information",
      { changes }
    );
  }, [logActivity, user?.id]);
  
  return {
    trackActivity,
    logActivity,
    logProjectActivity,
    logLeadActivity,
    logSettingsActivity,
    logUserActivity,
    logProfileUpdate,
    ActivityTypes,
    ActivityActions
  };
};

export default useActivityTracking;
