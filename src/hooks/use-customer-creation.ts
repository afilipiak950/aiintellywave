
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AddCustomerFormData } from '@/components/ui/customer/types';

export const useCustomerCreation = (onCustomerCreated: () => void, onClose: () => void) => {
  const [loading, setLoading] = useState(false);
  
  const createCustomer = async (formData: AddCustomerFormData) => {
    try {
      setLoading(true);
      
      console.log('Creating customer with data:', formData);
      
      let companyId = formData.companyId;
      
      // Step 1: Create the company record if we don't have an existing company ID
      if (!companyId) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: formData.companyName || formData.fullName, // Use company name if provided, otherwise use customer name
            contact_email: formData.email,
            contact_phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            industry: formData.industry
          })
          .select()
          .single();
          
        if (companyError) {
          console.error('Error creating company:', companyError);
          throw companyError;
        }
        
        if (!companyData) {
          throw new Error('Failed to create company: No data returned');
        }
        
        console.log('Company created successfully:', companyData);
        companyId = companyData.id;
      } else {
        console.log('Using existing company with ID:', companyId);
      }
      
      // Step 2: Create the user using Edge Function
      console.log('Creating user with Edge Function with data:', {
        email: formData.email,
        name: formData.fullName,
        company_id: companyId,
        role: formData.role || 'customer',
        language: formData.language || 'en'
      });

      const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          name: formData.fullName,
          company_id: companyId,
          role: formData.role || 'customer',
          language: formData.language || 'en'
        }
      });
      
      if (userError) {
        console.error('Error creating user:', userError);
        throw userError;
      }
      
      console.log('User created successfully:', userData);
      
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      
      onCustomerCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating customer:', error);
      
      // Provide a more detailed error message if available
      let errorMessage = 'Failed to create customer';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    createCustomer
  };
};
