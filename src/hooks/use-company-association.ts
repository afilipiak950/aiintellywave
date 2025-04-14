
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

export const useCompanyAssociation = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [featuresUpdated, setFeaturesUpdated] = useState<number>(0);
  const [hasCheckedAssociation, setHasCheckedAssociation] = useState(false);
  const { user } = useAuth();

  const checkCompanyAssociation = useCallback(async () => {
    // If we've already checked, don't check again
    if (hasCheckedAssociation) {
      return;
    }
    
    if (!user?.id) {
      console.log('No user logged in, skipping company association check');
      setLoading(false);
      setHasCheckedAssociation(true);
      return;
    }
    
    console.log('Checking company association for user:', user.id);
    setLoading(true);
    setError(null);
    
    try {
      // Get user's company from database without caching
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id, is_primary_company, is_manager_kpi_enabled')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error checking company association:', error);
        setError(new Error(`Database error: ${error.message}`));
        setLoading(false);
        setHasCheckedAssociation(true);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('User has no company association');
        setCompanyId(null);
      } else {
        console.log('User company associations:', data);
        
        // Find primary company or use the first one
        const primaryCompany = data.find(cu => cu.is_primary_company) || data[0];
        const primaryCompanyId = primaryCompany.company_id;
        
        console.log('Setting primary company ID:', primaryCompanyId);
        console.log('Manager KPI enabled:', data.some(cu => cu.is_manager_kpi_enabled));
        setCompanyId(primaryCompanyId);
        
        // Now check for company features
        await checkCompanyFeatures(primaryCompanyId);
      }
    } catch (err) {
      console.error('Error in useCompanyAssociation:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setHasCheckedAssociation(true);
    }
  }, [user, hasCheckedAssociation]);
  
  // Check if company has features record
  const checkCompanyFeatures = async (companyId: string) => {
    if (!companyId) return;
    
    try {
      console.log('Checking features for company:', companyId);
      
      // Check if company has features record
      const { data: featuresData, error: featuresError } = await supabase
        .from('company_features')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      
      if (featuresError && featuresError.code !== 'PGRST116') {
        console.error('Error checking company features:', featuresError);
        return;
      }
      
      // If no features record exists, create one with Google Jobs enabled by default
      if (!featuresData) {
        console.log('No features record found, creating default with Google Jobs enabled');
        
        const { data: newFeatures, error: createError } = await supabase
          .from('company_features')
          .insert([{ 
            company_id: companyId,
            google_jobs_enabled: true // Enable by default to ensure visibility
          }])
          .select();
        
        if (createError) {
          console.error('Error creating company features:', createError);
          return;
        }
        
        console.log('Created default features record:', newFeatures);
        
        // Increment the features updated counter to trigger UI updates
        setFeaturesUpdated(prev => prev + 1);
      } else {
        console.log('Found existing features record:', featuresData);
        // Still increment counter to ensure UI reflects current feature state
        setFeaturesUpdated(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error checking/creating company features:', err);
    }
  };

  // Set up subscription to company_features changes
  useEffect(() => {
    if (!companyId) return;
    
    console.log('Setting up company features subscription for company:', companyId);
    
    const channel = supabase
      .channel('company-features-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_features',
          filter: `company_id=eq.${companyId}`
        }, 
        (payload) => {
          console.log('Company features changed:', payload);
          
          // Force recheck and increment counter
          setFeaturesUpdated(prev => prev + 1);
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up company features subscription');
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  return {
    companyId,
    loading,
    error,
    featuresUpdated,
    checkCompanyAssociation
  };
};
