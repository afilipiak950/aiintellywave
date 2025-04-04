
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { PersonalInfoSection } from './profile-form/PersonalInfoSection';
import { CompanyInfoSection } from './profile-form/CompanyInfoSection';
import { FormActions } from './profile/FormActions';
import { useCompanies } from './profile-form/hooks/useCompanies';
import { handleProfileSubmit } from './profile-form/utils/formSubmission';

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
    company_size?: string;
    linkedin_url?: string;
    notes?: string;
    company_id?: string;
    company_role?: string;
    is_primary_company?: boolean;
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
  const { companies, loading: loadingCompanies } = useCompanies();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      position: initialData.position || '',
      company_id: initialData.company_id || '',
      company_role: initialData.company_role || 'customer',
      isPrimaryCompany: initialData.is_primary_company || false
    }
  });
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting profile form with data:', data);
      await handleProfileSubmit(data, customerId);
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
      <PersonalInfoSection 
        register={register} 
        errors={errors} 
      />
      
      <CompanyInfoSection 
        register={register} 
        errors={errors} 
        companies={companies}
        loadingCompanies={loadingCompanies}
      />
      
      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

export default CustomerProfileForm;
