
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from './use-toast';

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
  
  useEffect(() => {
    if (!user?.id) return;
    
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
          throw new Error(`Database error: ${companyUserError.message}`);
        }
        
        if (!companyUserData || companyUserData.length === 0) {
          console.error('User has no company association:', user.id);
          return;
        }
        
        // Find primary company or use the first one
        const primaryCompany = companyUserData.find(cu => cu.is_primary_company) || companyUserData[0];
        const companyId = primaryCompany.company_id;
        
        if (!companyId) {
          console.error('Company ID is null or undefined');
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
          throw new Error(`Database error: ${featuresError.message}`);
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
            throw new Error(`Failed to create features: ${createError.message}`);
          }
          
          setFeatures(newFeatures);
          console.log('Created default features:', newFeatures);
        }
      } catch (err) {
        console.error('Error in useCompanyFeatures:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Only show toast for unexpected errors
        if (!(err instanceof Error && err.message.includes('no rows returned'))) {
          toast({
            title: "Error",
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
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
      
      toast({
        title: "Feature Updated",
        description: `Google Jobs feature ${!features.google_jobs_enabled ? 'enabled' : 'disabled'}.`,
      });
      
    } catch (err) {
      console.error('Error toggling Google Jobs feature:', err);
      
      // Revert optimistic update
      setFeatures({
        ...features,
        google_jobs_enabled: features.google_jobs_enabled
      });
      
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    }
  };
  
  return { features, loading, error, toggleGoogleJobs };
};
