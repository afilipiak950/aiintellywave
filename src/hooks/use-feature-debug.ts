
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

  // Add a new function to toggle Job Offers
  const toggleJobOffers = async () => {
    if (!features || loading) return;
    
    try {
      // Get the company_id from features
      const companyId = features.company_id;
      
      // Toggle the job_offers_enabled flag in the companies table
      const { error } = await supabase
        .from('companies')
        .update({ 
          job_offers_enabled: !features.job_offers_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);
      
      if (error) {
        console.error('Error toggling Job Offers feature:', error);
        throw error;
      }
      
      // Reload the page to see changes
      window.location.reload();
      
    } catch (err) {
      console.error('Exception in toggleJobOffers:', err);
      throw err;
    }
  };
  
  return {
    features,
    loading,
    error,
    toggleGoogleJobs,
    toggleJobOffers, // Add this function to the returned object
    repairFeatures,
    isRepairingFeatures
  };
};
