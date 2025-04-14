
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

export const useCompanyAssociation = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [featuresUpdated, setFeaturesUpdated] = useState(0);
  const [isRepairing, setIsRepairing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Check company association and set up subscription
  useEffect(() => {
    if (!user) return;

    console.log('Setting up company association check for user:', user.id);
    
    // Check if the user has a company association
    const checkCompanyAssociation = async () => {
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id, is_primary_company')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking company association:', error);
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
      } catch (err) {
        console.error('Exception checking company association:', err);
      }
    };
    
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
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to repair the user's company association
  const handleRepairAssociation = async () => {
    if (!user || isRepairing) return;
    
    setIsRepairing(true);
    
    try {
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
        }, 1500);
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
    handleRepairAssociation
  };
};
