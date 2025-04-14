
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";

export interface CompanyFeatures {
  id: string;
  company_id: string;
  google_jobs_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompanyFeatures = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [features, setFeatures] = useState<CompanyFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get company ID first
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching company association:', userError);
        setError('Error fetching company association');
        setLoading(false);
        return;
      }
      
      if (!userData.company_id) {
        setError('No company ID found for user');
        setLoading(false);
        return;
      }
      
      setCompanyId(userData.company_id);
      
      // Get company features
      const { data, error } = await supabase
        .from('company_features')
        .select('*')
        .eq('company_id', userData.company_id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company features:', error);
        setError('Error fetching company features');
      } else {
        setFeatures(data as CompanyFeatures);
      }
    } catch (err) {
      console.error('Exception in features hook:', err);
      setError('Unexpected error fetching features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();

    // Set up a real-time subscription to company_features
    if (user) {
      const channel = supabase
        .channel('company-features-hook')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'company_features' 
          }, 
          (payload) => {
            console.log('Feature changes detected in hook:', payload);
            fetchFeatures();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    companyId,
    features,
    loading,
    error,
    refetch: fetchFeatures
  };
};
