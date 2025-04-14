
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface CompanyFeatures {
  id: string;
  company_id: string;
  google_jobs_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompanyFeatures = () => {
  const [features, setFeatures] = useState<CompanyFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Function to attempt automatic repair without user interaction
  const attemptAutoRepair = async () => {
    try {
      console.log('Attempting automatic repair of company features');
      const { data, error } = await supabase.functions.invoke('repair-company-associations');
      
      if (error) {
        console.error('Auto-repair failed:', error);
        return false;
      }
      
      console.log('Auto-repair result:', data);
      return data?.status === 'success';
    } catch (err) {
      console.error('Exception in auto-repair:', err);
      return false;
    }
  };
  
  useEffect(() => {
    if (!user?.id) return;
    
    let isRepairInProgress = false;
    
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get the user's company ID
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id, is_primary_company')
          .eq('user_id', user.id);
        
        if (companyUserError) {
          console.error('Error fetching company user association:', companyUserError);
          // Instead of throwing, try to auto-repair
          if (!isRepairInProgress) {
            isRepairInProgress = true;
            const repaired = await attemptAutoRepair();
            if (repaired) {
              // Try again with a slight delay to allow DB to update
              setTimeout(() => fetchFeatures(), 2000);
              return;
            }
          }
          setError(new Error(`Database error: ${companyUserError.message}`));
          return;
        }
        
        if (!companyUserData || companyUserData.length === 0) {
          console.error('User has no company association:', user.id);
          // Try to auto-repair
          if (!isRepairInProgress) {
            isRepairInProgress = true;
            const repaired = await attemptAutoRepair();
            if (repaired) {
              // Try again with a slight delay to allow DB to update
              setTimeout(() => fetchFeatures(), 2000);
              return;
            }
          }
          return;
        }
        
        // Find primary company or use the first one
        const primaryCompany = companyUserData.find(cu => cu.is_primary_company) || companyUserData[0];
        const companyId = primaryCompany.company_id;
        
        if (!companyId) {
          console.error('Company ID is null or undefined');
          // Try to auto-repair
          if (!isRepairInProgress) {
            isRepairInProgress = true;
            const repaired = await attemptAutoRepair();
            if (repaired) {
              // Try again with a slight delay to allow DB to update
              setTimeout(() => fetchFeatures(), 2000);
              return;
            }
          }
          return;
        }
        
        console.log(`Fetching features for company ID: ${companyId}`);
        
        // Get features for this company
        const { data: featuresData, error: featuresError } = await supabase
          .from('company_features')
          .select('*')
          .eq('company_id', companyId)
          .maybeSingle();
        
        if (featuresError && featuresError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching company features:', featuresError);
          setError(new Error(`Database error: ${featuresError.message}`));
          return;
        }
        
        if (featuresData) {
          setFeatures(featuresData);
          console.log('Retrieved features:', featuresData);
        } else {
          console.log('No features found, creating default features record');
          
          // Create default features record
          const { data: newFeatures, error: createError } = await supabase
            .from('company_features')
            .insert([{ 
              company_id: companyId,
              google_jobs_enabled: false 
            }])
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating company features:', createError);
            setError(new Error(`Failed to create features: ${createError.message}`));
            return;
          }
          
          setFeatures(newFeatures);
          console.log('Created default features:', newFeatures);
        }
      } catch (err) {
        console.error('Error in useCompanyFeatures:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
        isRepairInProgress = false;
      }
    };
    
    fetchFeatures();
    
    // Set up real-time subscription for company features changes
    const channel = supabase
      .channel('company-features-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_features' 
        }, 
        (payload) => {
          console.log('Company features changed:', payload);
          
          // Reload features when changes happen
          fetchFeatures();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const toggleGoogleJobs = async () => {
    if (!features || loading) return;
    
    try {
      // Optimistic update
      setFeatures({
        ...features,
        google_jobs_enabled: !features.google_jobs_enabled
      });
      
      const { error } = await supabase
        .from('company_features')
        .update({ 
          google_jobs_enabled: !features.google_jobs_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', features.id);
      
      if (error) {
        throw error;
      }
      
      // No toast notification for the update
      
    } catch (err) {
      console.error('Error toggling Google Jobs feature:', err);
      
      // Revert optimistic update
      setFeatures({
        ...features,
        google_jobs_enabled: features.google_jobs_enabled
      });
    }
  };
  
  return { features, loading, error, toggleGoogleJobs };
};
