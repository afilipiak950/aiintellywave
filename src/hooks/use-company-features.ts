import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

interface CompanyFeatures {
  id: string;
  company_id: string;
  google_jobs_enabled: boolean;
  job_offers_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompanyFeatures = () => {
  const [features, setFeatures] = useState<CompanyFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
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

  const fetchCompanyFeatures = useCallback(async () => {
    if (!user?.id) return;
    
    let isRepairInProgress = false;
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching company features for user:', user.id);
      
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select('company_id, is_primary_company')
        .eq('user_id', user.id);
      
      if (companyUserError) {
        console.error('Error fetching company user association:', companyUserError);
        if (!isRepairInProgress) {
          isRepairInProgress = true;
          const repaired = await attemptAutoRepair();
          if (repaired) {
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
        if (!isRepairInProgress) {
          isRepairInProgress = true;
          const repaired = await attemptAutoRepair();
          if (repaired) {
            setTimeout(() => fetchCompanyFeatures(), 2000);
            return;
          }
        }
        setLoading(false);
        return;
      }
      
      const primaryCompany = companyUserData.find(cu => cu.is_primary_company) || companyUserData[0];
      const companyId = primaryCompany.company_id;
      
      if (!companyId) {
        console.error('Company ID is null or undefined');
        if (!isRepairInProgress) {
          isRepairInProgress = true;
          const repaired = await attemptAutoRepair();
          if (repaired) {
            setTimeout(() => fetchCompanyFeatures(), 2000);
            return;
          }
        }
        setLoading(false);
        return;
      }
      
      console.log(`Fetching features for company ID: ${companyId}`);
      
      const { data: featuresData, error: featuresError } = await supabase
        .from('company_features')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      
      if (featuresError && featuresError.code !== 'PGRST116') {
        console.error('Error fetching company features:', featuresError);
        setError(new Error(`Database error: ${featuresError.message}`));
        setLoading(false);
        return;
      }
      
      if (featuresData) {
        console.log('Retrieved features:', featuresData);
        
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('job_offers_enabled')
          .eq('id', companyId)
          .single();
        
        if (companyError) {
          console.error('[useCompanyFeatures] Error fetching job_offers_enabled:', companyError);
        }
        
        const updatedFeatures = {
          ...featuresData,
          google_jobs_enabled: true,
          job_offers_enabled: companyData?.job_offers_enabled || false
        };
        
        const { error: updateError } = await supabase
          .from('company_features')
          .update({ google_jobs_enabled: true })
          .eq('id', featuresData.id);
          
        if (updateError) {
          console.error('Error updating google_jobs_enabled to true:', updateError);
        } else {
          console.log('Successfully enabled Google Jobs for user');
        }
        
        setFeatures(updatedFeatures);
      } else {
        console.log('No features found, creating default features record with Google Jobs enabled by default');
        
        const { data: newFeatures, error: createError } = await supabase
          .from('company_features')
          .insert([{ 
            company_id: companyId,
            google_jobs_enabled: true
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating company features:', createError);
          setError(new Error(`Failed to create features: ${createError.message}`));
          setLoading(false);
          return;
        }
        
        console.log('Created default features with Google Jobs enabled:', newFeatures);
        setFeatures(newFeatures);
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
    
    console.log('Initializing company features for user:', user.id);
    fetchCompanyFeatures();
    
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
          
          fetchCompanyFeatures();
        }
      )
      .subscribe();
    
    return () => {
      console.log('Cleaning up company features subscription');
      supabase.removeChannel(channel);
    };
  }, [user, fetchCompanyFeatures]);
  
  const toggleGoogleJobs = async () => {
    if (!features || loading) return;
    
    try {
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
      
    } catch (err) {
      console.error('Error toggling Google Jobs feature:', err);
      
      setFeatures({
        ...features,
        google_jobs_enabled: features.google_jobs_enabled
      });
      
      toast({
        title: "Error",
        description: "Failed to update Google Jobs feature status",
        variant: "destructive"
      });
    }
  };
  
  return { features, loading, error, toggleGoogleJobs, fetchCompanyFeatures };
};
