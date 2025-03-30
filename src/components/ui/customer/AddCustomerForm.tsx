
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchCompanies } from '@/services/companyService';
import { AddCustomerFormData } from './types';
import { customerFormSchema, CustomerFormSchema, defaultFormValues } from './form/schema';
import CustomerCompanySelection from './form/CustomerCompanySelection';
import CustomerFormFields from './form/CustomerFormFields';
import FormActions from './form/FormActions';

interface AddCustomerFormProps {
  onSubmit: (data: AddCustomerFormData) => void;
  loading: boolean;
  onCancel: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onSubmit, loading, onCancel }) => {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [companyOption, setCompanyOption] = useState<"existing" | "new">("new");
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultFormValues
  });

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await fetchCompanies();
        if (companiesData) {
          setCompanies(companiesData);
        }
      } catch (error) {
        console.error("Error loading companies:", error);
      }
    };
    
    loadCompanies();
  }, []);

  const selectedCompanyOption = watch('companyOption');
  const selectedRole = watch('role');

  const onFormSubmit = (data: CustomerFormSchema) => {
    // Prepare the data for submission
    const submissionData: AddCustomerFormData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || "",
      role: data.role,
      address: data.address || "",
      city: data.city || "",
      country: data.country || "",
      industry: data.industry || "",
      language: data.language || "en",
      companyName: data.companyOption === "new" ? data.companyName || data.fullName : ""
    };

    // If using existing company, find its name
    if (data.companyOption === "existing" && data.selectedCompanyId) {
      const selectedCompany = companies.find(company => company.id === data.selectedCompanyId);
      if (selectedCompany) {
        submissionData.companyId = data.selectedCompanyId;
        submissionData.companyName = selectedCompany.name;
      }
    }

    onSubmit(submissionData);
  };

  const handleCompanyOptionChange = (value: "existing" | "new") => {
    setCompanyOption(value);
    setValue("companyOption", value);
    
    // Reset the other field
    if (value === "new") {
      setValue("selectedCompanyId", "");
    } else {
      setValue("companyName", "");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 py-4">
      <div className="space-y-4">
        <CustomerFormFields 
          register={register} 
          setValue={setValue} 
          errors={errors} 
        />

        <CustomerCompanySelection 
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          companies={companies}
          companyOption={companyOption}
          onCompanyOptionChange={handleCompanyOptionChange}
        />
      </div>

      <FormActions loading={loading} onCancel={onCancel} />
    </form>
  );
};

export default AddCustomerForm;
