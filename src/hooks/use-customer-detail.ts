
// This is a new file we need to create to properly handle the profile data
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Customer } from '@/types/customer';

interface UseCustomerDetailReturn {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  refreshCustomer: () => Promise<void>;
  updateCustomerProfile: (profileData: Partial<Customer>) => Promise<boolean>;
}

export const useCustomerDetail = (customerId: string): UseCustomerDetailReturn => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get user data from company_users
      const { data: userData, error: userError } = await supabase
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

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw new Error(userError.message);
      }

      // Then get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          phone,
          position,
          is_active,
          address,
          department,
          job_title,
          company_size,
          linkedin_url,
          notes
        `)
        .eq('id', customerId)
        .maybeSingle();

      if (profileError) {
        // If the profile error is about missing columns, we'll still proceed
        // but log a warning for debugging
        console.warn('Error fetching profile data:', profileError);
        // Don't throw error here as we want to continue with whatever data we have
      }

      // Combine the data to create a customer object
      if (userData) {
        const company = userData.companies || {};
        const firstName = profileData?.first_name || userData.first_name || '';
        const lastName = profileData?.last_name || userData.last_name || '';
        const fullName = userData.full_name || `${firstName} ${lastName}`.trim() || 'Unnamed Customer';

        const customerData: Customer = {
          id: customerId,
          name: fullName,
          email: userData.email || company.contact_email || '',
          phone: profileData?.phone || '',
          status: profileData?.is_active === false ? 'inactive' : 'active',
          company: company.name,
          company_id: company.id,
          city: company.city || '',
          country: company.country || '',
          avatar: profileData?.avatar_url || userData.avatar_url,
          first_name: firstName,
          last_name: lastName,
          position: profileData?.position || '',
          role: userData.role,
          is_admin: userData.is_admin,
          
          // Extended profile fields
          address: profileData?.address || '',
          department: profileData?.department || '',
          job_title: profileData?.job_title || '',
          company_size: profileData?.company_size,
          linkedin_url: profileData?.linkedin_url || '',
          notes: profileData?.notes || ''
        };

        setCustomer(customerData);
      } else {
        setError('Customer not found');
      }
    } catch (error: any) {
      console.error('Error in useCustomerDetail:', error);
      setError(error.message || 'An error occurred loading customer data');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load customer details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerProfile = async (profileData: Partial<Customer>): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Update the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          position: profileData.position,
          address: profileData.address,
          department: profileData.department,
          job_title: profileData.job_title,
          company_size: profileData.company_size,
          linkedin_url: profileData.linkedin_url,
          notes: profileData.notes
        })
        .eq('id', customerId);
        
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Update email separately in company_users if provided
      if (profileData.email) {
        const { error: emailUpdateError } = await supabase
          .from('company_users')
          .update({ email: profileData.email })
          .eq('user_id', customerId);
          
        if (emailUpdateError) {
          console.warn('Error updating email:', emailUpdateError);
          // Don't throw, continue with other updates
        }
      }
      
      // Refresh customer data
      await fetchCustomerData();
      
      toast({
        title: 'Profile Updated',
        description: 'Customer profile has been successfully updated.'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating customer profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update customer profile',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  return {
    customer,
    loading,
    error,
    refreshCustomer: fetchCustomerData,
    updateCustomerProfile
  };
};
