
import { supabase } from '@/integrations/supabase/client';

export interface ActivityDetails {
  message?: string;
  previousValue?: any;
  newValue?: any;
  [key: string]: any;
}

export interface ActivityData {
  entity_type: string;
  entity_id: string;
  action: string;
  details?: ActivityDetails;
}

/**
 * Tracks a user activity in the database
 */
export const trackUserActivity = async (
  userId: string | undefined,
  activityData: ActivityData
): Promise<boolean> => {
  if (!userId) {
    console.warn('Cannot track activity: No user ID provided');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        entity_type: activityData.entity_type,
        entity_id: activityData.entity_id,
        action: activityData.action,
        details: activityData.details || {}
      });
      
    if (error) {
      console.error('Error tracking user activity:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception while tracking user activity:', err);
    return false;
  }
};

// Predefined activity types for consistency
export const ActivityTypes = {
  PROJECT: 'project',
  LEAD: 'lead',
  SETTING: 'settings',
  USER: 'user',
  DOCUMENT: 'document',
  COMPANY: 'company',
  INTEGRATION: 'integration',
};

// Predefined action types for consistency
export const ActivityActions = {
  // Project actions
  PROJECT_CREATED: 'created a new project',
  PROJECT_UPDATED: 'updated project',
  PROJECT_DELETED: 'deleted project',
  PROJECT_STATUS_CHANGED: 'changed project status',
  
  // Lead actions
  LEAD_CREATED: 'created a new lead',
  LEAD_UPDATED: 'updated lead',
  LEAD_STATUS_CHANGED: 'changed lead status',
  LEAD_DELETED: 'deleted lead',
  LEAD_IMPORTED: 'imported leads',
  
  // User actions
  USER_LOGGED_IN: 'logged in',
  USER_UPDATED_PROFILE: 'updated profile',
  USER_CHANGED_PASSWORD: 'changed password',
  USER_ENABLED_2FA: 'enabled two-factor authentication',
  USER_DISABLED_2FA: 'disabled two-factor authentication',
  
  // Settings actions
  SETTINGS_UPDATED: 'updated settings',
  
  // Document actions
  DOCUMENT_UPLOADED: 'uploaded document',
  DOCUMENT_DOWNLOADED: 'downloaded document',
  DOCUMENT_DELETED: 'deleted document',
  
  // Company actions
  COMPANY_CREATED: 'created a new company',
  COMPANY_UPDATED: 'updated company',
  COMPANY_DELETED: 'deleted company',
  
  // Integration actions
  INTEGRATION_ADDED: 'added integration',
  INTEGRATION_UPDATED: 'updated integration',
  INTEGRATION_REMOVED: 'removed integration',
};

export default {
  trackUserActivity,
  ActivityTypes,
  ActivityActions
};
