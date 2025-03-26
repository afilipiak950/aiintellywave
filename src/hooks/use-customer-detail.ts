
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
        
        // Fetch company user data separately
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select('role, is_admin, company_id')
          .eq('user_id', customerId)
          .maybeSingle();
          
        if (companyUserError && !companyUserError.message.includes('No rows found')) {
          throw companyUserError;
        }
        
        // If we have company data, fetch it separately
        let company = {
          id: '',
          name: '',
          description: '',
          contact_email: '',
          contact_phone: '',
          city: '',
          country: ''
        };
        
        if (companyUserData?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyUserData.company_id)
            .maybeSingle();
            
          if (!companyError && companyData) {
            company = {
              id: companyData.id,
              name: companyData.name,
              description: companyData.description || '',
              contact_email: companyData.contact_email || '',
              contact_phone: companyData.contact_phone || '',
              city: companyData.city || '',
              country: companyData.country || ''
            };
          }
        }
        
        // Combine the data
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
