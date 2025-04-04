
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
          console.log('Loaded companies:', companiesData.length);
        }
      } catch (error) {
        console.error("Error loading companies:", error);
      }
    };
    
    loadCompanies();
  }, []);

  // Track what's being watched
  const selectedCompanyId = watch('selectedCompanyId');
  const email = watch('email');
  const companyFormOption = watch('companyOption');

  useEffect(() => {
    // Reset company ID when switching between options
    if (companyOption === "new") {
      setValue("selectedCompanyId", "");
    } else if (companyOption === "existing" && companies.length > 0 && !selectedCompanyId) {
      // Try to find best company match based on email domain
      if (email && email.includes('@')) {
        const domain = email.split('@')[1].toLowerCase();
        const domainPrefix = domain.split('.')[0].toLowerCase();
        
        const matchingCompany = companies.find(company => {
          const companyNameLower = company.name.toLowerCase();
          return (
            domainPrefix === companyNameLower || 
            companyNameLower.includes(domainPrefix) || 
            domainPrefix.includes(companyNameLower)
          );
        });
        
        if (matchingCompany) {
          console.log(`Using email domain to select company: ${matchingCompany.name}`);
          setValue("selectedCompanyId", matchingCompany.id);
        } else {
          // Optionally pre-select first company when no match found
          setValue("selectedCompanyId", companies[0].id);
        }
      } else {
        // Optionally pre-select first company when switching to existing
        setValue("selectedCompanyId", companies[0].id);
      }
    }
  }, [companyOption, companies, setValue, selectedCompanyId, email]);

  const onFormSubmit = (data: CustomerFormSchema) => {
    console.log('Form submitted with data:', { 
      ...data,
      companyOption,
      selectedCompanyId: data.selectedCompanyId 
    });
    
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
      companyName: data.companyOption === "new" ? data.companyName || data.fullName : "",
      password: data.password // Include password in submission data
    };

    // If using existing company, find its name and add company ID
    if (data.companyOption === "existing" && data.selectedCompanyId) {
      console.log(`Using existing company with ID: ${data.selectedCompanyId}`);
      const selectedCompany = companies.find(company => company.id === data.selectedCompanyId);
      
      if (selectedCompany) {
        submissionData.companyId = data.selectedCompanyId;
        submissionData.companyName = selectedCompany.name;
        console.log(`Selected company: ${selectedCompany.name} (${data.selectedCompanyId})`);
      } else {
        console.warn(`Company with ID ${data.selectedCompanyId} not found in list`);
      }
    }

    console.log('Submitting customer data:', {
      ...submissionData,
      password: submissionData.password ? '********' : undefined
    });
    
    onSubmit(submissionData);
  };

  const handleCompanyOptionChange = (value: "existing" | "new") => {
    console.log(`Company option changed to: ${value}`);
    setCompanyOption(value);
    setValue("companyOption", value);
    
    // Reset the other field
    if (value === "new") {
      setValue("selectedCompanyId", "");
    } else {
      setValue("companyName", "");
      
      // Try to find best company match based on email domain
      if (email && email.includes('@') && companies.length > 0) {
        const domain = email.split('@')[1].toLowerCase();
        const domainPrefix = domain.split('.')[0].toLowerCase();
        
        const matchingCompany = companies.find(company => {
          const companyNameLower = company.name.toLowerCase();
          return (
            domainPrefix === companyNameLower || 
            companyNameLower.includes(domainPrefix) || 
            domainPrefix.includes(companyNameLower)
          );
        });
        
        if (matchingCompany) {
          console.log(`Using email domain to select company: ${matchingCompany.name}`);
          setValue("selectedCompanyId", matchingCompany.id);
        } else {
          // Pre-select first company if available
          setValue("selectedCompanyId", companies[0].id);
        }
      } else if (companies.length > 0) {
        // Pre-select first company if available
        setValue("selectedCompanyId", companies[0].id);
        console.log(`Pre-selected company: ${companies[0].name} (${companies[0].id})`);
      }
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
