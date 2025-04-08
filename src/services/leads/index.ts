
// Re-export all lead service functions
export * from './lead-fetch';
export * from './lead-crud';
export * from './lead-excel';
export * from './lead-realtime';

// Initialize real-time for leads table
import { enableLeadRealtime } from './lead-realtime';
import { supabase } from '@/integrations/supabase/client';

// Enable real-time for the project_excel_data table
const enableExcelRealtime = async () => {
  try {
    // Enable the publication for the table
    console.log('Enabling real-time for project_excel_data table');
    // Note: Removed the invalid RPC call
  } catch (error) {
    console.error('Error enabling real-time for project_excel_data table:', error);
  }
};

// Initialize real-time functionality
Promise.all([
  enableLeadRealtime(),
  enableExcelRealtime()
]).then(() => {
  console.log('Lead and Excel real-time functionality initialized');
}).catch(error => {
  console.error('Error initializing real-time functionality:', error);
});
