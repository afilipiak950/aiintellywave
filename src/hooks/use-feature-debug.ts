
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/auth";
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from '@/hooks/use-toast';
import { useCompanyFeatures } from './use-company-features';

export const useFeatureDebug = () => {
  const { user } = useAuth();
  const { features, loading, error, refetch } = useCompanyFeatures();
  const [repairing, setRepairing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Effect to fetch company association
  useEffect(() => {
    if (!user) return;
    
    const fetchCompanyAssociation = async () => {
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching company association:', error);
          return;
        }
        
        setCompanyId(data.company_id);
      } catch (err) {
        console.error('Exception fetching company association:', err);
      }
    };
    
    fetchCompanyAssociation();
  }, [user]);

  // Refresh company features
  const checkFeatures = useCallback(async () => {
    toast({
      title: "Refreshing",
      description: "Checking company features..."
    });
    
    await refetch();
    
    toast({
      title: "Refreshed",
      description: "Feature status has been refreshed."
    });
  }, [refetch]);

  // Repair features - creates default feature settings if they don't exist
  const repairFeatures = useCallback(async () => {
    if (!user || !companyId) {
      toast({
        title: "Error",
        description: "User or company information missing",
        variant: "destructive"
      });
      return;
    }
    
    setRepairing(true);
    
    try {
      // Check if features record exists
      const { data, error } = await supabase
        .from('company_features')
        .select('id')
        .eq('company_id', companyId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking features:', error);
        throw error;
      }
      
      // If record doesn't exist, create it
      if (!data) {
        const { error: insertError } = await supabase
          .from('company_features')
          .insert({
            company_id: companyId,
            google_jobs_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating feature record:', insertError);
          throw insertError;
        }
        
        console.log('Created new feature record for company:', companyId);
      } else {
        // Update the timestamp on existing record
        const { error: updateError } = await supabase
          .from('company_features')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
          
        if (updateError) {
          console.error('Error updating feature record:', updateError);
          throw updateError;
        }
        
        console.log('Updated existing feature record for company:', companyId);
      }
      
      // Refresh feature data
      await refetch();
      
      toast({
        title: "Repair Successful",
        description: "Feature configuration has been repaired."
      });
    } catch (err: any) {
      console.error('Feature repair error:', err);
      toast({
        title: "Repair Failed",
        description: err.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setRepairing(false);
    }
  }, [user, companyId, refetch]);

  // Toggle Google Jobs feature
  const toggleGoogleJobs = useCallback(async () => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "No company association found.",
        variant: "destructive"
      });
      return;
    }
    
    if (!features) {
      toast({
        title: "Error",
        description: "No feature configuration found. Click 'Repair Features' to create it.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newValue = !features.google_jobs_enabled;
      console.log(`[Feature Debug] Toggling Google Jobs from ${features.google_jobs_enabled} to ${newValue}`);
      
      const { error } = await supabase
        .from('company_features')
        .update({ 
          google_jobs_enabled: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);
        
      if (error) {
        console.error('Error toggling Google Jobs feature:', error);
        throw error;
      }
      
      console.log(`[Feature Debug] Toggle successful. New value: ${newValue}`);
      
      // Refresh features data
      await refetch();
      
      toast({
        title: newValue ? "Feature Enabled" : "Feature Disabled",
        description: newValue 
          ? "Google Jobs (Jobangebote) feature has been enabled. You may need to refresh the page to see the menu item."
          : "Google Jobs (Jobangebote) feature has been disabled. The menu item will be removed after reload.",
        variant: "default"
      });
    } catch (err: any) {
      console.error('Toggle Google Jobs error:', err);
      toast({
        title: "Toggle Failed",
        description: err.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  }, [companyId, features, refetch]);

  return {
    user,
    companyId,
    features,
    loading,
    repairing,
    checkFeatures,
    repairFeatures,
    toggleGoogleJobs
  };
};
