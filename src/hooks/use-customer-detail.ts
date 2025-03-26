
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { Customer } from '@/hooks/use-customers';

export const useCustomerDetail = (customerId: string | undefined) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        // Fetch company user data
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select(`
            role,
            is_admin,
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
          .single();
          
        if (companyUserError && !companyUserError.message.includes('No rows found')) {
          throw companyUserError;
        }
        
        // Combine the data
        const company = companyUserData?.companies || {
          id: '',
          name: '',
          description: '',
          contact_email: '',
          contact_phone: '',
          city: '',
          country: ''
        };
        
        const customerData: Customer = {
          id: profileData.id,
          name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unnamed User',
          email: '',
          phone: profileData.phone || '',
          status: profileData.is_active ? 'active' : 'inactive',
          avatar: profileData.avatar_url,
          position: profileData.position || '',
          company: company.name || '',
          company_id: company.id || '',
          company_name: company.name || '',
          company_role: companyUserData?.role || '',
          city: company.city || '',
          country: company.country || '',
          contact_email: company.contact_email || '',
          contact_phone: company.contact_phone || ''
        };
        
        setCustomer(customerData);
      } catch (error: any) {
        console.error('Error fetching customer details:', error);
        setError(error.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  return { customer, loading, error };
};
