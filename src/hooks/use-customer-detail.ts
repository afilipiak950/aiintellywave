import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import { toast } from './use-toast';

export const useCustomerDetail = (customerId?: string) => {
  const [customer, setCustomer] = useState<UICustomer | null>(null);
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
      console.log(`[useCustomerDetail] Fetching customer details for ID: ${customerId}`);

      // Get the company user data - should be a single record due to our constraint
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
            country,
            website
          )
        `)
        .eq('user_id', customerId)
        .maybeSingle();

      if (companyUserError) {
        console.error('[useCustomerDetail] Error fetching company user data:', companyUserError);
        throw companyUserError;
      }

      console.log(`[useCustomerDetail] Found company user record:`, companyUserData);

      // If no company association found, get basic profile data as fallback
      if (!companyUserData) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        
        if (profileError || !profileData) {
          throw new Error('No customer data found for this ID');
        }

        // Return minimal customer data from profile
        const minimalCustomer: UICustomer = {
          id: customerId,
          name: profileData?.first_name && profileData?.last_name 
            ? `${profileData.first_name} ${profileData.last_name}`.trim()
            : 'Unnamed User',
          email: '',
          status: 'inactive',
          avatar: profileData?.avatar_url,
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          phone: profileData?.phone || '',
          position: profileData?.position || '',
        };

        setCustomer(minimalCustomer);
        console.log('[useCustomerDetail] Using minimal profile data for customer');
        return;
      }

      // Get profile data with only the columns that exist
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
        console.error('[useCustomerDetail] Error fetching profiles data:', profileError);
        // Continue with partial data rather than throwing
      }

      // Combine the data
      const customerData: UICustomer = {
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
        website: companyUserData?.companies?.website, // Added website property now that it's in the type definition
        
        // Profile data with fallbacks
        first_name: profileData?.first_name || companyUserData?.first_name || '',
        last_name: profileData?.last_name || companyUserData?.last_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        
        // Default values for missing fields
        address: '',
        department: '',
        job_title: '',
        company_size: undefined,
        linkedin_url: '',
        notes: '',

        // Add the associated companies as array with single item
        associated_companies: companyUserData ? [{
          id: companyUserData.company_id,
          name: companyUserData.companies?.name || '',
          company_id: companyUserData.company_id,
          company_name: companyUserData.companies?.name || '',
          role: companyUserData.role
        }] : []
      };

      console.log('[useCustomerDetail] Customer data assembled successfully');
      setCustomer(customerData);
    } catch (error: any) {
      console.error('[useCustomerDetail] Error fetching customer detail:', error);
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
