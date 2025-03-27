
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FormField, FormSection } from './profile/FormSection';
import { FormTextArea } from './profile/FormTextArea';
import { FormActions } from './profile/FormActions';
import { FormSelect } from './profile/FormSelect';

interface Company {
  id: string;
  name: string;
}

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
    company_id?: string;
    company_role?: string;
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      position: initialData.position || '',
      company_id: initialData.company_id || '',
      company_role: initialData.company_role || 'customer'
    }
  });
  
  // Fetch companies list
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        setCompanies(data || []);
      } catch (error: any) {
        console.error('Error loading companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies list',
          variant: 'destructive'
        });
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Update the profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          position: data.position
        })
        .eq('id', customerId);
        
      if (profileError) throw profileError;
      
      // Update company association in company_users table
      if (data.company_id) {
        const { error: companyUserError } = await supabase
          .from('company_users')
          .upsert({
            user_id: customerId,
            company_id: data.company_id,
            role: data.company_role || 'customer'
          }, {
            onConflict: 'user_id, company_id'
          });
          
        if (companyUserError) throw companyUserError;
      }
      
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
  
  // Role options
  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' }
  ];
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Personal Information">
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
      
      <FormSection title="Company Information">
        <FormSelect
          id="company_id"
          label="Company"
          register={register}
          error={errors.company_id}
          disabled={loadingCompanies}
          options={[
            { value: '', label: 'Select a company...' },
            ...companies.map(company => ({
              value: company.id,
              label: company.name
            }))
          ]}
        />
        
        <FormSelect
          id="company_role"
          label="Role"
          register={register}
          error={errors.company_role}
          options={roleOptions}
        />
        
        <FormField
          id="position"
          label="Position"
          placeholder="Position/Title"
          register={register}
          error={errors.position}
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
