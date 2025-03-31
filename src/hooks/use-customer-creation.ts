
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
          throw new Error(`Failed to create company: ${companyError.message}`);
        }
        
        if (!companyData) {
          throw new Error('Failed to create company: No data returned');
        }
        
        console.log('Company created successfully:', companyData);
        companyId = companyData.id;
      } else {
        console.log('Using existing company with ID:', companyId);
      }
      
      // Step 2: Create the user in Supabase Auth
      // Check if service role key is available by attempting admin API
      try {
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
          console.error('Error creating user with admin API:', userError);
          throw userError;
        }
        
        if (!userData || !userData.user) {
          throw new Error('Failed to create user: No user data returned');
        }
        
        console.log('User created successfully with admin API:', userData.user.id);
        
        // Step 3: Add the user to company_users table
        await addUserToCompanyUsers(userData.user.id, formData, companyId);
        
        // Step 4: Add user role record
        await addUserRoleRecord(userData.user.id, formData.role);
        
        toast({
          title: "Success",
          description: "Customer created successfully",
        });
        
        onCustomerCreated();
        onClose();
      } catch (adminError) {
        console.warn('Admin API not available, trying edge function:', adminError);
        
        // Fallback to edge function if admin API fails (usually due to missing service role key)
        try {
          // Call the create-user edge function instead
          const { data: funcData, error: funcError } = await supabase.functions.invoke('create-user', {
            body: {
              email: formData.email,
              password: formData.password,
              name: formData.fullName,
              role: formData.role,
              company_id: companyId,
              language: formData.language || 'en'
            }
          });
          
          if (funcError || (funcData && !funcData.success)) {
            console.error('Edge function error:', funcError || funcData?.error);
            throw new Error(funcError?.message || funcData?.error || 'Failed to create user via edge function');
          }
          
          if (!funcData || !funcData.id) {
            throw new Error('No user ID returned from edge function');
          }
          
          console.log('User created successfully via edge function:', funcData.id);
          
          toast({
            title: "Success",
            description: "Customer created successfully via edge function",
          });
          
          onCustomerCreated();
          onClose();
        } catch (funcCallError) {
          console.error('Error calling edge function:', funcCallError);
          throw new Error(`Edge function error: ${funcCallError.message}`);
        }
      }
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

  // Helper function to add user to company_users table
  const addUserToCompanyUsers = async (userId: string, formData: AddCustomerFormData, companyId: string) => {
    const companyUserPayload = {
      user_id: userId,
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
      throw new Error(`Failed to add user to company: ${companyUserError.message}`);
    }
  };

  // Helper function to add user role record
  const addUserRoleRecord = async (userId: string, role: string) => {
    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });
        
      if (roleError) {
        console.warn('Warning: Could not add user role record:', roleError);
        // Don't throw, this is non-critical
      }
    } catch (roleErr) {
      console.warn('Warning: Error adding user role:', roleErr);
      // Don't throw, this is non-critical
    }
  };
  
  return {
    loading,
    createCustomer
  };
};
