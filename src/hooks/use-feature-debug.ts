
import { useState } from 'react';
import { useCompanyFeatures } from './use-company-features';
import { supabase } from '@/integrations/supabase/client';

export const useFeatureDebug = () => {
  const [isRepairingFeatures, setIsRepairingFeatures] = useState(false);
  const companyFeatures = useCompanyFeatures();
  
  // Remove the refetch property since it doesn't exist in the returned object
  const { features, loading, error, toggleGoogleJobs } = companyFeatures;
  
  const repairFeatures = async () => {
    setIsRepairingFeatures(true);
    
    try {
      // Call the Edge Function to repair feature associations
      const { data, error } = await supabase.functions.invoke('repair-company-associations');
      
      if (error) {
        console.error('Error repairing features:', error);
        throw new Error(error.message);
      }
      
      console.log('Feature repair result:', data);
      
      // No need to call refetch since it doesn't exist
      // Just reload the page to get fresh data
      window.location.reload();
      
      return data;
    } catch (err) {
      console.error('Exception in repairFeatures:', err);
      throw err;
    } finally {
      setIsRepairingFeatures(false);
    }
  };
  
  return {
    features,
    loading,
    error,
    toggleGoogleJobs,
    repairFeatures,
    isRepairingFeatures
  };
};
