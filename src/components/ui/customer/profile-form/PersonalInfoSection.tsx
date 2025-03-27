
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField, FormSection } from '../profile/FormSection';

interface PersonalInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const PersonalInfoSection = ({ 
  register, 
  errors 
}: PersonalInfoSectionProps) => {
  return (
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
  );
};
