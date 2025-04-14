
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

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

  // Dedicated function to fetch company features for better error handling and retries
  const fetchCompanyFeatures = useCallback(async () => {
    if (!user?.id) return;
    
    let isRepairInProgress = false;
    setLoading(true);
    setError(null);
    
    try {
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
            setTimeout(() => fetchCompanyFeatures(), 2000);
            return;
          }
        }
        setError(new Error(`Database error: ${companyUserError.message}`));
        setLoading(false);
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
            setTimeout(() => fetchCompanyFeatures(), 2000);
            return;
          }
        }
        setLoading(false);
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
            setTimeout(() => fetchCompanyFeatures(), 2000);
            return;
          }
        }
        setLoading(false);
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
        setLoading(false);
        return;
      }
      
      if (featuresData) {
        setFeatures(featuresData);
        console.log('Retrieved features:', featuresData);
      } else {
        console.log('No features found, creating default features record with Google Jobs enabled by default');
        
        // Create default features record - ENABLING GOOGLE JOBS BY DEFAULT TO FIX VISIBILITY ISSUE
        const { data: newFeatures, error: createError } = await supabase
          .from('company_features')
          .insert([{ 
            company_id: companyId,
            google_jobs_enabled: true // Set to true by default to ensure feature visibility
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating company features:', createError);
          setError(new Error(`Failed to create features: ${createError.message}`));
          setLoading(false);
          return;
        }
        
        setFeatures(newFeatures);
        console.log('Created default features with Google Jobs enabled:', newFeatures);
        
        // Show toast notification about enabled feature
        toast({
          title: "Feature Enabled",
          description: "Jobangebote feature is now available in your menu",
          variant: "default"
        });
      }
    } catch (err) {
      console.error('Error in useCompanyFeatures:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      isRepairInProgress = false;
    }
  }, [user]);
  
  useEffect(() => {
    if (!user?.id) return;
    
    fetchCompanyFeatures();
    
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
          console.log('Company features changed in hook:', payload);
          
          // Reload features when changes happen
          fetchCompanyFeatures();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCompanyFeatures]);
  
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
      
      // Show toast notification about the update
      toast({
        title: features.google_jobs_enabled ? "Google Jobs Disabled" : "Google Jobs Enabled",
        description: features.google_jobs_enabled 
          ? "Jobangebote feature has been disabled" 
          : "Jobangebote feature is now available in your menu",
        variant: "default"
      });
      
    } catch (err) {
      console.error('Error toggling Google Jobs feature:', err);
      
      // Revert optimistic update
      setFeatures({
        ...features,
        google_jobs_enabled: features.google_jobs_enabled
      });
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to update Google Jobs feature status",
        variant: "destructive"
      });
    }
  };
  
  return { features, loading, error, toggleGoogleJobs, fetchCompanyFeatures };
};
