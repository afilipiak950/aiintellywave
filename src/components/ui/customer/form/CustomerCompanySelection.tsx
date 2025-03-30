
import React from 'react';
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
  errors,
  companies,
  companyOption,
  onCompanyOptionChange,
}) => {
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
        </div>
      ) : (
        <div>
          <Select onValueChange={(value) => setValue("selectedCompanyId", value)}>
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
        </div>
      )}
    </div>
  );
};

export default CustomerCompanySelection;
