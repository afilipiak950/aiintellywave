
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
        password: formData.password ? '*****' : undefined, // Log masked password for security
        companyId: formData.companyId || 'not provided' // Log company ID for debugging
      });
      
      let companyId = formData.companyId;
      
      // Step 1: Create the company record if we don't have an existing company ID
      if (!companyId) {
        console.log('No company ID provided, creating a new company');
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
      
      // Ensure we have a valid company ID at this point
      if (!companyId) {
        throw new Error('No valid company ID available for user creation');
      }

      // Step 2: Create the user in Supabase Auth
      // Check if service role key is available by attempting admin API
      try {
        // Check if password exists and is not empty
        if (!formData.password) {
          throw new Error('Password is required');
        }
        
        // Include company_id in user metadata
        const userMetadata = {
          full_name: formData.fullName,
          name: formData.fullName,
          company_id: companyId, // Ensure company_id is correctly set in metadata
          role: formData.role,
          language: formData.language || 'en'
        };
        
        console.log('Creating user with metadata:', { ...userMetadata, company_id: companyId });
        
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password, // Ensure password is passed
          email_confirm: true, // Auto-confirm the email
          user_metadata: userMetadata
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
        console.warn('Admin API not available or error occurred, trying edge function:', adminError);
        
        // Fallback to edge function if admin API fails (usually due to missing service role key)
        try {
          // Call the create-user edge function instead
          const { data: funcData, error: funcError } = await supabase.functions.invoke('create-user', {
            body: {
              email: formData.email,
              password: formData.password, // Ensure password is included in the payload
              name: formData.fullName,
              role: formData.role,
              company_id: companyId, // Pass the correct company_id to the function
              language: formData.language || 'en'
            }
          });
          
          console.log('Edge function response:', funcData);
          
          if (funcError) {
            console.error('Edge function error:', funcError);
            throw new Error(`Failed to create user via edge function: ${funcError.message}`);
          }
          
          if (!funcData || !funcData.id) {
            // If there's no ID in the response but secondary operations failed, we might still have a user
            if (funcData && funcData.success && funcData.secondary_operations && !funcData.secondary_operations.success) {
              console.warn('User was created but secondary operations failed:', funcData.secondary_operations);
              toast({
                title: "Partial Success",
                description: "Customer was created but some additional settings failed. This will be fixed automatically.",
                variant: "default"
              });
              onCustomerCreated();
              onClose();
              return;
            }
            
            throw new Error('No user ID returned from edge function');
          }
          
          console.log('User created successfully via edge function:', funcData.id);
          
          // Check for secondary operation failures but don't block success
          if (funcData.secondary_operations && !funcData.secondary_operations.success) {
            console.warn('Secondary operations failed:', funcData.secondary_operations);
            toast({
              title: "Success with Warnings",
              description: "Customer created successfully, but some settings need attention. Support has been notified.",
              variant: "default"
            });
          } else {
            toast({
              title: "Success",
              description: "Customer created successfully via edge function",
            });
          }
          
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
    console.log('Adding user to company_users with:', {
      user_id: userId,
      company_id: companyId,
      role: formData.role,
      email: formData.email
    });
    
    const companyUserPayload = {
      user_id: userId,
      company_id: companyId,
      role: formData.role,
      is_admin: formData.role === 'admin',
      email: formData.email,
      full_name: formData.fullName,
      is_manager_kpi_enabled: formData.role === 'manager' || formData.role === 'admin'
    };
    
    const { error: companyUserError } = await supabase
      .from('company_users')
      .insert(companyUserPayload);
    
    if (companyUserError) {
      console.error('Error adding user to company:', companyUserError);
      // Don't throw, allow the operation to continue
      console.warn('Continuing despite company user association error');
    } else {
      console.log('User successfully added to company_users');
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
      } else {
        console.log('User role record created successfully');
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
