
// Re-export all lead service functions
export * from './lead-fetch';
export * from './lead-crud';
export * from './lead-excel';
export * from './lead-realtime';

// Initialize real-time for leads table
import { enableLeadRealtime } from './lead-realtime';
enableLeadRealtime().then(() => {
  console.log('Lead real-time functionality initialized');
});
