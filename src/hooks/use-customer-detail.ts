
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { formatUserDataToCustomer } from '@/utils/customerUtils';

export const useCustomerDetail = (customerId?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail(customerId);
    }
  }, [customerId]);

  const fetchCustomerDetail = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching customer detail for:', userId);
      
      // Step 1: Fetch company_user data
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select(`
          role,
          is_admin,
          company_id,
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
        .eq('user_id', userId)
        .maybeSingle();
      
      if (companyUserError) {
        console.error('Error fetching company user data:', companyUserError);
        throw companyUserError;
      }
      
      if (!companyUserData) {
        throw new Error('Customer not found');
      }
      
      // Step 2: Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        throw profileError;
      }
      
      // Step 3: Attempt to get user email
      let userEmail = '';
      
      try {
        // Try admin API first (requires service role)
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        
        if (error) {
          console.warn('Admin get user failed, will try alternate method:', error);
        } else if (data?.user) {
          userEmail = data.user.email || '';
          console.log('Got user email via admin API:', userEmail);
        }
      } catch (err) {
        console.warn('Could not fetch user via admin API:', err);
      }
      
      // If admin API failed, try to get current user as a fallback
      if (!userEmail) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id === userId) {
          userEmail = userData.user.email || '';
          console.log('Got current user email as fallback:', userEmail);
        }
      }
      
      // Ensure company data has default values if it's null or missing properties
      const company = companyUserData.companies || {
        id: '',
        name: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        city: '',
        country: ''
      };
      
      // Format the customer data
      const customerData = {
        id: userId,
        email: userEmail,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        full_name: profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unnamed User',
        avatar_url: profileData?.avatar_url,
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        is_active: profileData?.is_active !== false,
        company_id: company.id || companyUserData.company_id,
        company_name: company.name || '',
        company_role: companyUserData.role || '',
        is_admin: companyUserData.is_admin || false,
        contact_email: company.contact_email || userEmail || '',
        contact_phone: company.contact_phone || profileData?.phone || '',
        city: company.city || '',
        country: company.country || ''
      };
      
      const formattedCustomer = formatUserDataToCustomer(customerData);
      console.log('Formatted customer detail:', formattedCustomer);
      
      setCustomer(formattedCustomer);
    } catch (error: any) {
      console.error('Error in fetchCustomerDetail:', error);
      setError(error.message || 'Failed to load customer details');
      
      toast({
        title: "Error",
        description: error.message || 'Failed to load customer details',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { customer, loading, error };
};
