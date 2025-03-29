
import { fetchLeadsData } from './lead-fetch';

// This file is now completely unified with the main leads system
// It only exists for backward compatibility
export const fetchExcelLeadsData = async (projectId?: string) => {
  console.log('fetchExcelLeadsData: Using unified lead system');
  return fetchLeadsData({ projectId });
};
