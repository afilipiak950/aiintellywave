
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
    // Generate a timestamp for the activity
    const timestamp = new Date().toISOString();
    
    // Use the raw client to bypass type checking for tables that might
    // not be in the generated types yet
    const { error } = await supabase.from('user_activities' as any)
      .insert({
        user_id: userId,
        entity_type: activityData.entity_type,
        entity_id: activityData.entity_id,
        action: activityData.action,
        details: activityData.details || {},
        created_at: timestamp
      });
      
    if (error) {
      console.error('Error tracking user activity:', error);
      return false;
    }
    
    console.log('Activity tracked successfully:', {
      user_id: userId,
      ...activityData,
      created_at: timestamp
    });
    
    return true;
  } catch (err) {
    console.error('Exception while tracking user activity:', err);
    return false;
  }
};

// Log activity for current page view
export const trackPageView = async (userId: string | undefined, pageName: string, pageUrl: string) => {
  if (!userId) return false;
  
  try {
    const activityData: ActivityData = {
      entity_type: 'page',
      entity_id: pageUrl,
      action: 'viewed page',
      details: {
        message: `Viewed ${pageName} page`,
        url: pageUrl
      }
    };
    
    return await trackUserActivity(userId, activityData);
  } catch (err) {
    console.error('Error tracking page view:', err);
    return false;
  }
};

// Generate sample test activities for development/testing
export const generateSampleActivities = async (userId: string) => {
  if (!userId) return false;
  
  try {
    const activities = [
      {
        entity_type: 'user',
        entity_id: userId,
        action: 'logged in',
        details: { message: 'User logged in', device: 'web browser' }
      },
      {
        entity_type: 'project',
        entity_id: 'sample-project-id',
        action: 'created project',
        details: { message: 'Created new test project', project_name: 'Test Project' }
      },
      {
        entity_type: 'lead',
        entity_id: 'sample-lead-id',
        action: 'updated lead',
        details: { message: 'Updated lead status', previous_status: 'new', new_status: 'contacted' }
      },
      {
        entity_type: 'user',
        entity_id: 'sample-user-id',
        action: 'invited user',
        details: { message: 'Invited test@example.com as customer', email: 'test@example.com', role: 'customer' }
      }
    ];
    
    for (const activity of activities) {
      await trackUserActivity(userId, activity);
    }
    
    return true;
  } catch (err) {
    console.error('Error generating sample activities:', err);
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
  USER_INVITED: 'invited user',
  
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
  trackPageView,
  generateSampleActivities,
  ActivityTypes,
  ActivityActions
};
