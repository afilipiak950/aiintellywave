import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useFeatureDebug = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [features, setFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);

  const checkFeatures = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get company ID first
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching user company:', userError);
        setLoading(false);
        return;
      }
      
      setCompanyId(userData.company_id);
      
      if (!userData.company_id) {
        setLoading(false);
        return;
      }
      
      // Get company features
      const { data, error } = await supabase
        .from('company_features')
        .select('*')
        .eq('company_id', userData.company_id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company features:', error);
      }
      
      console.log("Company features data:", data);
      setFeatures(data);
    } catch (err) {
      console.error('Error checking features:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const repairFeatures = async () => {
    if (!user || !companyId) return;
    
    setRepairing(true);
    
    try {
      // Check if record exists
      const { data, error } = await supabase
        .from('company_features')
        .select('id')
        .eq('company_id', companyId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking feature record existence:', error);
        toast({
          title: "Error",
          description: "Could not check if feature record exists",
          variant: "destructive"
        });
        return;
      }
      
      let result;
      if (data?.id) {
        // Update existing record
        result = await supabase
          .from('company_features')
          .update({
            updated_at: new Date().toISOString(),
            // Keep current google_jobs_enabled status or default to false
            google_jobs_enabled: features?.google_jobs_enabled ?? false
          })
          .eq('company_id', companyId);
      } else {
        // Create new record
        result = await supabase
          .from('company_features')
          .insert({
            company_id: companyId,
            google_jobs_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        console.error('Error repairing features:', result.error);
        toast({
          title: "Repair Failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Repair Complete",
          description: "Feature settings have been repaired",
          variant: "default"
        });
        
        // Refresh
        await checkFeatures();
      }
    } catch (err) {
      console.error('Exception repairing features:', err);
      toast({
        title: "Repair Exception",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setRepairing(false);
    }
  };
  
  const toggleGoogleJobs = async () => {
    if (!user || !companyId || !features) return;
    
    setLoading(true);
    
    try {
      const newStatus = !features.google_jobs_enabled;
      
      const { error } = await supabase
        .from('company_features')
        .update({
          google_jobs_enabled: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);
        
      if (error) {
        console.error('Error toggling Google Jobs:', error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: newStatus ? "Google Jobs Enabled" : "Google Jobs Disabled",
          description: newStatus 
            ? "You should now see the Jobangebote menu item"
            : "The Jobangebote menu item will be hidden",
          variant: "default"
        });
        
        // Refresh data
        await checkFeatures();
      }
    } catch (err) {
      console.error('Exception toggling Google Jobs:', err);
      toast({
        title: "Toggle Exception",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkFeatures();
  }, [user]);

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
