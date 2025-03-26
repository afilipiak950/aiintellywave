
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

      // Then get extended profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          first_name,
          last_name,
          avatar_url,
          phone,
          position,
          address,
          department,
          job_title,
          company_size,
          linkedin_url,
          notes
        `)
        .eq('id', customerId)
        .maybeSingle();

      if (companyUserError && !companyUserData) {
        throw companyUserError;
      }

      // Combine the data
      const customerData: Customer = {
        id: customerId,
        name: companyUserData?.full_name || 
              (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
        email: companyUserData?.email,
        status: 'active', // Default status
        avatar: companyUserData?.avatar_url || profileData?.avatar_url,
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
        
        // Extended profile data
        first_name: profileData?.first_name || companyUserData?.first_name,
        last_name: profileData?.last_name || companyUserData?.last_name,
        phone: profileData?.phone,
        position: profileData?.position,
        
        // New extended fields
        address: profileData?.address,
        department: profileData?.department,
        job_title: profileData?.job_title,
        company_size: profileData?.company_size,
        linkedin_url: profileData?.linkedin_url,
        notes: profileData?.notes
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
