
import { supabase } from '@/integrations/supabase/client';

let initialized = false;

/**
 * Enables real-time updates for the leads table
 */
export const enableLeadRealtime = async () => {
  if (initialized) {
    console.log('Lead real-time already initialized');
    return;
  }
  
  try {
    // Set the replica identity to full for the table
    // This ensures all data is sent with the change event
    
    // Already done in previous migrations or by Supabase

    // Enable the publication for the table
    // Already done in previous migrations or by Supabase
    
    initialized = true;
    console.log('Lead real-time functionality initialized');
    return true;
  } catch (error) {
    console.error('Error initializing lead real-time:', error);
    return false;
  }
};

/**
 * Subscribe to real-time updates for project_excel_data table
 * @param callback Function to call when an update occurs
 * @returns Channel object that can be used to unsubscribe
 */
export const subscribeToExcelDataUpdates = (
  projectId: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
) => {
  // Create a new channel for this subscription
  const channel = supabase.channel(`excel-data-${projectId}`);
  
  // Configure the channel to listen for changes
  let configuredChannel = channel;
  
  // Add insert handler if provided
  if (onInsert) {
    configuredChannel = configuredChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'project_excel_data',
        filter: `project_id=eq.${projectId}`
      },
      onInsert
    );
  }
  
  // Add update handler if provided
  if (onUpdate) {
    configuredChannel = configuredChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'project_excel_data',
        filter: `project_id=eq.${projectId}`
      },
      onUpdate
    );
  }
  
  // Add delete handler if provided
  if (onDelete) {
    configuredChannel = configuredChannel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'project_excel_data',
        filter: `project_id=eq.${projectId}`
      },
      onDelete
    );
  }
  
  // Subscribe to the channel
  configuredChannel.subscribe((status) => {
    console.log(`Excel data real-time subscription status: ${status}`);
  });
  
  // Return the channel so it can be unsubscribed
  return channel;
};

/**
 * Unsubscribe from real-time updates
 * @param channel Channel to unsubscribe from
 */
export const unsubscribeFromExcelDataUpdates = (channel: any) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
};
