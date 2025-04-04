
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { CustomerFormSchema } from './schema';

interface CompanySelectionProps {
  register: UseFormRegister<CustomerFormSchema>;
  setValue: UseFormSetValue<CustomerFormSchema>;
  watch: UseFormWatch<CustomerFormSchema>;
  errors: FieldErrors<CustomerFormSchema>;
  companies: Array<{ id: string; name: string }>;
  companyOption: "new" | "existing";
  onCompanyOptionChange: (value: "new" | "existing") => void;
}

const CustomerCompanySelection: React.FC<CompanySelectionProps> = ({
  register,
  setValue,
  watch,
  errors,
  companies,
  companyOption,
  onCompanyOptionChange,
}) => {
  const selectedCompanyId = watch('selectedCompanyId');
  const email = watch('email') || '';
  
  // Debugging log when company selection changes
  useEffect(() => {
    if (selectedCompanyId) {
      console.log('[CustomerCompanySelection] Company selected:', selectedCompanyId);
      const selectedCompany = companies.find(c => c.id === selectedCompanyId);
      if (selectedCompany) {
        console.log('[CustomerCompanySelection] Selected company name:', selectedCompany.name);
      }
    }
  }, [selectedCompanyId, companies]);
  
  // Auto-suggest company based on email domain when creating a new user
  useEffect(() => {
    if (companyOption === "existing" && email && email.includes('@') && companies.length > 0) {
      const domain = email.split('@')[1].toLowerCase();
      const domainPrefix = domain.split('.')[0].toLowerCase();
      
      console.log('[CustomerCompanySelection] Checking email domain match for:', domain, 'prefix:', domainPrefix);
      
      // Try to find a company that matches the email domain
      const matchingCompany = companies.find(company => {
        const companyNameLower = company.name.toLowerCase();
        return (
          domainPrefix === companyNameLower || 
          companyNameLower.includes(domainPrefix) || 
          domainPrefix.includes(companyNameLower)
        );
      });
      
      if (matchingCompany && selectedCompanyId !== matchingCompany.id) {
        console.log(`[CustomerCompanySelection] Found matching company for email domain: ${matchingCompany.name}`);
        setValue("selectedCompanyId", matchingCompany.id);
        // Set this as the primary company since it matches the email domain
        setValue("isPrimaryCompany", true);
      }
    }
  }, [email, companies, companyOption, setValue, selectedCompanyId]);
  
  return (
    <div className="space-y-2">
      <Label>Company</Label>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <Button
          type="button"
          variant={companyOption === "new" ? "default" : "outline"}
          onClick={() => onCompanyOptionChange("new")}
          className="w-full"
        >
          Create New Company
        </Button>
        <Button
          type="button"
          variant={companyOption === "existing" ? "default" : "outline"}
          onClick={() => onCompanyOptionChange("existing")}
          className="w-full"
        >
          Use Existing Company
        </Button>
      </div>

      {companyOption === "new" ? (
        <div>
          <Input
            id="companyName"
            {...register("companyName")}
            placeholder="Company Name"
          />
          {errors.companyName && (
            <p className="text-sm text-red-500">{errors.companyName.message}</p>
          )}
          <div className="mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("isPrimaryCompany")}
                defaultChecked={true}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Set as primary company</span>
            </label>
          </div>
        </div>
      ) : (
        <div>
          <Select 
            onValueChange={(value) => {
              console.log('[CustomerCompanySelection] Company selection changed to:', value);
              setValue("selectedCompanyId", value);
            }}
            value={selectedCompanyId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.selectedCompanyId && (
            <p className="text-sm text-red-500">{errors.selectedCompanyId.message}</p>
          )}
          <div className="mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("isPrimaryCompany")}
                defaultChecked={true}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Set as primary company</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCompanySelection;
