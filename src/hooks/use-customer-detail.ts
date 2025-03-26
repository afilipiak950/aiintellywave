
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';
import { toast } from './use-toast';

export const useCustomerDetail = (customerId?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerDetail = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      setError('No customer ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, try to get from company_users for comprehensive data
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select(`
          user_id,
          company_id,
          role,
          is_admin,
          email,
          full_name,
          first_name,
          last_name, 
          avatar_url,
          last_sign_in_at,
          created_at_auth,
          companies:company_id (
            id,
            name,
            description,
            contact_email,
            contact_phone,
            city,
            country
          )
        `)
        .eq('user_id', customerId)
        .maybeSingle();

      if (companyUserError) {
        throw companyUserError;
      }

      // Then get the basic profile data we know exists in the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          first_name,
          last_name,
          avatar_url,
          phone,
          position
        `)
        .eq('id', customerId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profiles data:', profileError);
        // Continue with partial data rather than throwing
      }

      // Combine the data
      const customerData: Customer = {
        id: customerId,
        name: companyUserData?.full_name || 
              (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
        email: companyUserData?.email,
        status: 'active', // Default status
        avatar: companyUserData?.avatar_url || (profileData ? profileData.avatar_url : undefined),
        role: companyUserData?.role,
        company: companyUserData?.companies?.name,
        company_id: companyUserData?.company_id,
        company_name: companyUserData?.companies?.name,
        company_role: companyUserData?.role,
        contact_email: companyUserData?.companies?.contact_email || companyUserData?.email,
        contact_phone: companyUserData?.companies?.contact_phone,
        city: companyUserData?.companies?.city,
        country: companyUserData?.companies?.country,
        description: companyUserData?.companies?.description,
        
        // Profile data with fallbacks for safety
        first_name: profileData ? profileData.first_name : companyUserData?.first_name,
        last_name: profileData ? profileData.last_name : companyUserData?.last_name,
        phone: profileData ? profileData.phone : undefined,
        position: profileData ? profileData.position : undefined,
        
        // For extended fields that may not exist yet, set as undefined
        address: undefined,
        department: undefined,
        job_title: undefined,
        company_size: undefined,
        linkedin_url: undefined,
        notes: undefined
      };

      setCustomer(customerData);
    } catch (error: any) {
      console.error('Error fetching customer detail:', error);
      setError(error.message || 'Failed to load customer details');
      toast({
        title: "Error",
        description: error.message || "Failed to load customer details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerDetail();
  }, [fetchCustomerDetail]);

  return {
    customer,
    loading,
    error,
    refreshCustomer: fetchCustomerDetail
  };
};
