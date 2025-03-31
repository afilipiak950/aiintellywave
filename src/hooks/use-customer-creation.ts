
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AddCustomerFormData } from '@/components/ui/customer/types';

export const useCustomerCreation = (onCustomerCreated: () => void, onClose: () => void) => {
  const [loading, setLoading] = useState(false);
  
  const createCustomer = async (formData: AddCustomerFormData) => {
    try {
      setLoading(true);
      
      console.log('Creating customer with data:', { 
        ...formData, 
        password: formData.password ? '*****' : undefined // Log masked password for security
      });
      
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
      
      // Step 2: Create the user in Supabase Auth directly using admin.createUser
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          full_name: formData.fullName,
          name: formData.fullName,
          company_id: companyId,
          role: formData.role,
          language: formData.language || 'en'
        }
      });
      
      if (userError) {
        console.error('Error creating user in Auth:', userError);
        throw userError;
      }
      
      if (!userData || !userData.user) {
        throw new Error('Failed to create user in Auth: No user data returned');
      }
      
      console.log('User created successfully in Auth:', userData.user.id);
      
      // Step 3: Add the user to company_users table
      const companyUserPayload = {
        user_id: userData.user.id,
        company_id: companyId,
        role: formData.role,
        is_admin: formData.role === 'admin',
        email: formData.email,
        full_name: formData.fullName,
      };
      
      const { error: companyUserError } = await supabase
        .from('company_users')
        .insert(companyUserPayload);
      
      if (companyUserError) {
        console.error('Error adding user to company:', companyUserError);
        throw companyUserError;
      }
      
      // Step 4: Add user role record
      try {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userData.user.id,
            role: formData.role
          });
          
        if (roleError) {
          console.warn('Warning: Could not add user role record:', roleError);
        }
      } catch (roleErr) {
        console.warn('Warning: Error adding user role:', roleErr);
      }
      
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      
      onCustomerCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
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
