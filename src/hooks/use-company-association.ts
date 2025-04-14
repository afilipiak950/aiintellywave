
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from './use-toast';

export const useCompanyAssociation = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [featuresUpdated, setFeaturesUpdated] = useState<number>(0);
  const { user } = useAuth();

  const checkCompanyAssociation = useCallback(async () => {
    if (!user?.id) {
      console.log('No user logged in, skipping company association check');
      setLoading(false);
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
    }
  }, [user]);
  
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
        
        // Show toast notification about enabled feature
        if (featuresUpdated > 0) { // Don't show on initial load
          toast({
            title: "Feature Enabled",
            description: "Google Jobs feature is now available in your menu",
            variant: "default"
          });
        }
      } else {
        console.log('Found existing features record:', featuresData);
        // Still increment counter to ensure UI reflects current feature state
        setFeaturesUpdated(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error checking/creating company features:', err);
    }
  };
  
  // Initial check on mount
  useEffect(() => {
    if (user?.id) {
      checkCompanyAssociation();
    } else {
      setLoading(false);
    }
  }, [user, checkCompanyAssociation]);
  
  // Set up subscription to company_users changes
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Setting up company association subscription for user:', user.id);
    
    const channel = supabase
      .channel('company-association-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_users',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Company association changed:', payload);
          // Check if is_manager_kpi_enabled was updated
          if (payload.eventType === 'UPDATE' && 
              payload.new && payload.old &&
              'is_manager_kpi_enabled' in payload.new && 
              'is_manager_kpi_enabled' in payload.old &&
              payload.new.is_manager_kpi_enabled !== payload.old.is_manager_kpi_enabled) {
            
            console.log('Manager KPI access changed:', payload.new.is_manager_kpi_enabled);
            
            // Show notification
            toast({
              title: payload.new.is_manager_kpi_enabled ? 
                "Manager KPI Dashboard Enabled" : 
                "Manager KPI Dashboard Disabled",
              description: payload.new.is_manager_kpi_enabled ?
                "Manager KPI Dashboard is now available in your menu" :
                "Manager KPI Dashboard has been disabled",
              variant: "default"
            });
            
            // Force window reload to update navigation
            window.location.reload();
          } else {
            checkCompanyAssociation();
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up company association subscription');
      supabase.removeChannel(channel);
    };
  }, [user, checkCompanyAssociation]);

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
          
          // Show toast notification about feature change if not initial load
          if (featuresUpdated > 0 && payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const oldFeatures = payload.old;
            const newFeatures = payload.new;
            
            // Check if Google Jobs was enabled
            if ('google_jobs_enabled' in newFeatures && 'google_jobs_enabled' in oldFeatures) {
              if (!oldFeatures.google_jobs_enabled && newFeatures.google_jobs_enabled) {
                toast({
                  title: "Feature Enabled",
                  description: "Google Jobs feature is now available in your menu",
                  variant: "default"
                });
              } else if (oldFeatures.google_jobs_enabled && !newFeatures.google_jobs_enabled) {
                toast({
                  title: "Feature Disabled",
                  description: "Google Jobs feature has been disabled",
                  variant: "default"
                });
              }
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up company features subscription');
      supabase.removeChannel(channel);
    };
  }, [companyId, featuresUpdated]);

  return {
    companyId,
    loading,
    error,
    featuresUpdated,
    checkCompanyAssociation
  };
};
