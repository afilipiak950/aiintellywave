
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

export const useCompanyAssociation = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [featuresUpdated, setFeaturesUpdated] = useState(0);
  const [isRepairing, setIsRepairing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Function to check company association with improved error handling
  const checkCompanyAssociation = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Checking company association for user:', user.id);
      
      // Get the user's company association
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id, is_primary_company')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error checking company association:', error);
        // Auto-repair without showing errors
        handleRepairAssociation();
        return;
      }
      
      if (!data || data.length === 0) {
        console.error('User has no company association:', user.id);
        setCompanyId(null);
        
        // Auto-repair without showing errors
        handleRepairAssociation();
        return;
      }
      
      // Find primary company or use the first one
      const primaryCompany = data.find(cu => cu.is_primary_company) || data[0];
      
      if (!primaryCompany.company_id) {
        console.error('Missing company association for user:', user.id);
        setCompanyId(null);
        
        // Auto-repair without showing errors
        handleRepairAssociation();
        return;
      }
      
      // No error message, just set the company ID
      setCompanyId(primaryCompany.company_id);
      
      // Also check if Google Jobs feature is enabled for this company
      console.log('Checking Google Jobs feature status for company:', primaryCompany.company_id);
      const { data: featuresData, error: featuresError } = await supabase
        .from('company_features')
        .select('google_jobs_enabled')
        .eq('company_id', primaryCompany.company_id)
        .maybeSingle();
        
      if (featuresError && featuresError.code !== 'PGRST116') {
        console.error('Error checking features:', featuresError);
        return;
      }
      
      // If no features found, create default with Google Jobs enabled
      if (!featuresData) {
        console.log('No features found, creating default with Google Jobs enabled');
        const { error: createError } = await supabase
          .from('company_features')
          .insert([{
            company_id: primaryCompany.company_id,
            google_jobs_enabled: true // Enable by default
          }]);
          
        if (createError) {
          console.error('Error creating features:', createError);
          return;
        }
        
        // Increment counter to force UI update
        setFeaturesUpdated(prev => prev + 1);
        
        // Show toast about enabled feature
        toast({
          title: "Feature Enabled",
          description: "Jobangebote feature is now available in your menu",
          variant: "default"
        });
        
        // Force reload after short delay to ensure UI updates
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Increment counter even if features exist to ensure component updates
        setFeaturesUpdated(prev => prev + 1);
      }
    } catch (err) {
      console.error('Exception checking company association:', err);
    }
  }, [user]);
  
  // Check company association and set up subscription
  useEffect(() => {
    if (!user) return;

    console.log('Setting up company association check for user:', user.id);
    
    checkCompanyAssociation();
    
    // Add a subscription to ensure feature changes are reflected
    const channel = supabase
      .channel('company-association-features')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_features' 
        }, 
        (payload) => {
          console.log('Company features changed in association hook:', payload);
          // Increment counter to force re-render
          setFeaturesUpdated(prev => prev + 1);
          
          // If google_jobs_enabled changed, show notification and force reload
          if (payload.eventType === 'UPDATE' && 
              payload.new && payload.old && 
              payload.new.google_jobs_enabled !== payload.old.google_jobs_enabled) {
            
            toast({
              title: payload.new.google_jobs_enabled ? "Feature Enabled" : "Feature Disabled",
              description: payload.new.google_jobs_enabled 
                ? "Jobangebote feature is now available in your menu" 
                : "Jobangebote feature has been disabled",
              variant: "default"
            });
            
            // Force page reload after a short delay for UI update
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up company association subscription');
      supabase.removeChannel(channel);
    };
  }, [user, checkCompanyAssociation]);

  // Function to repair the user's company association
  const handleRepairAssociation = async () => {
    if (!user || isRepairing) return;
    
    setIsRepairing(true);
    
    try {
      console.log('Repairing company association for user:', user.id);
      
      // Call the Edge Function to repair the account without showing toast
      const { data, error } = await supabase.functions.invoke('repair-company-associations');
      
      if (error) {
        console.error('Error repairing company association:', error);
        return;
      }
      
      console.log('Repair result:', data);
      
      if (data?.status === 'success') {
        // Force reload after a short delay without notifying the user
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error('Exception repairing company association:', err);
    } finally {
      setIsRepairing(false);
    }
  };

  return {
    companyId,
    featuresUpdated,
    isRepairing,
    handleRepairAssociation,
    checkCompanyAssociation
  };
};
