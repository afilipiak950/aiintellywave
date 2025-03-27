
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FormField, FormSection } from './profile/FormSection';
import { FormTextArea } from './profile/FormTextArea';
import { FormActions } from './profile/FormActions';

interface CustomerProfileFormProps {
  customerId: string;
  initialData?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    position?: string;
    address?: string;
    department?: string;
    job_title?: string;
    company_size?: number;
    linkedin_url?: string;
    notes?: string;
  };
  onProfileUpdated: () => void;
  onCancel?: () => void;
}

const CustomerProfileForm = ({
  customerId,
  initialData = {},
  onProfileUpdated,
  onCancel
}: CustomerProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      position: initialData.position || '',
      address: initialData.address || '',
      department: initialData.department || '',
      job_title: initialData.job_title || '',
      company_size: initialData.company_size?.toString() || '',
      linkedin_url: initialData.linkedin_url || '',
      notes: initialData.notes || ''
    }
  });
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Convert company_size to number if provided
      const formattedData = {
        ...data,
        company_size: data.company_size ? parseInt(data.company_size) : null
      };
      
      // Update the profile in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update(formattedData)
        .eq('id', customerId);
        
      if (error) throw error;
      
      toast({
        title: 'Profile Updated',
        description: 'The customer profile has been successfully updated.'
      });
      
      onProfileUpdated();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection>
        <FormField
          id="first_name"
          label="First Name"
          placeholder="First name"
          register={register}
          error={errors.first_name}
        />
        
        <FormField
          id="last_name"
          label="Last Name"
          placeholder="Last name"
          register={register}
          error={errors.last_name}
        />
        
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Email address"
          register={register}
          error={errors.email}
        />
        
        <FormField
          id="phone"
          label="Phone"
          placeholder="Phone number"
          register={register}
          error={errors.phone}
        />
      </FormSection>
      
      <FormSection>
        <FormField
          id="position"
          label="Position"
          placeholder="Position/Title"
          register={register}
          error={errors.position}
        />
        
        <FormField
          id="department"
          label="Department"
          placeholder="Department"
          register={register}
          error={errors.department}
        />
        
        <FormField
          id="job_title"
          label="Job Title"
          placeholder="Job title"
          register={register}
          error={errors.job_title}
        />
        
        <FormField
          id="company_size"
          label="Company Size"
          type="number"
          placeholder="Number of employees"
          register={register}
          error={errors.company_size}
        />
      </FormSection>
      
      <FormSection>
        <FormField
          id="address"
          label="Address"
          placeholder="Full address"
          register={register}
          error={errors.address}
          className="md:col-span-2"
        />
        
        <FormField
          id="linkedin_url"
          label="LinkedIn URL"
          placeholder="LinkedIn profile URL"
          register={register}
          error={errors.linkedin_url}
          className="md:col-span-2"
        />
        
        <FormTextArea
          id="notes"
          label="Notes"
          placeholder="Additional notes about this customer"
          register={register}
          error={errors.notes}
          className="md:col-span-2"
        />
      </FormSection>
      
      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

export default CustomerProfileForm;
