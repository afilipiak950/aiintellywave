
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
        .eq('user_id', customerId);

      if (companyUserError) {
        console.error('[useCustomerDetail] Error fetching company user data:', companyUserError);
        throw companyUserError;
      }

      console.log(`[useCustomerDetail] Found ${companyUserData?.length || 0} company user records`);

      // If no data or multiple data, handle appropriately
      if (!companyUserData || companyUserData.length === 0) {
        // Try to fetch from profiles as fallback
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

      // Get the primary company data (we'll prioritize non-null email entries or just take the first)
      const primaryCompanyUser = companyUserData.find(record => record.email) || companyUserData[0];
      
      // Then get the profile data with only the columns that exist
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
        name: primaryCompanyUser?.full_name || 
              (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
        email: primaryCompanyUser?.email,
        status: 'active', // Default status
        avatar: primaryCompanyUser?.avatar_url || (profileData ? profileData.avatar_url : undefined),
        role: primaryCompanyUser?.role,
        company: primaryCompanyUser?.companies?.name,
        company_id: primaryCompanyUser?.company_id,
        company_name: primaryCompanyUser?.companies?.name,
        company_role: primaryCompanyUser?.role,
        contact_email: primaryCompanyUser?.companies?.contact_email || primaryCompanyUser?.email,
        contact_phone: primaryCompanyUser?.companies?.contact_phone,
        city: primaryCompanyUser?.companies?.city,
        country: primaryCompanyUser?.companies?.country,
        description: primaryCompanyUser?.companies?.description,
        
        // Profile data with fallbacks
        first_name: profileData?.first_name || primaryCompanyUser?.first_name || '',
        last_name: profileData?.last_name || primaryCompanyUser?.last_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        
        // Default values for missing fields
        address: '',
        department: '',
        job_title: '',
        company_size: undefined,
        linkedin_url: '',
        notes: '',

        // Add the associated companies as additional data
        associated_companies: companyUserData.map(record => ({
          id: record.company_id,
          name: record.companies?.name || '',
          company_id: record.company_id,
          company_name: record.companies?.name || '',
          role: record.role
        }))
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
