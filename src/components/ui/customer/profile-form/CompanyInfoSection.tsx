
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField, FormSection } from '../profile/FormSection';
import { FormSelect } from '../profile/FormSelect';
import { FormCheckbox } from '../profile/FormCheckbox';

interface Company {
  id: string;
  name: string;
}

interface CompanyInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  companies: Company[];
  loadingCompanies: boolean;
}

export const CompanyInfoSection = ({ 
  register, 
  errors,
  companies,
  loadingCompanies
}: CompanyInfoSectionProps) => {
  // Role options
  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' }
  ];
  
  // Create company options - using a placeholder instead of empty string
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));
  
  return (
    <FormSection title="Company Information">
      <FormSelect
        id="company_id"
        label="Company"
        register={register}
        error={errors.company_id as any}
        disabled={loadingCompanies}
        options={companyOptions}
        className="relative"
      />
      
      <FormSelect
        id="company_role"
        label="Role"
        register={register}
        error={errors.company_role as any}
        options={roleOptions}
      />
      
      <FormField
        id="position"
        label="Position"
        placeholder="Position/Title"
        register={register}
        error={errors.position as any}
      />
      
      <FormCheckbox
        id="isPrimaryCompany"
        label="Set as primary company"
        description="Make this the primary company associated with this user"
        register={register}
        error={errors.isPrimaryCompany as any}
      />
    </FormSection>
  );
};
