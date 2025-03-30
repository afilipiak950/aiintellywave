
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCompanies } from '@/services/companyService';
import { AddCustomerFormData } from './types';

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  selectedCompanyId: z.string().optional(),
  companyOption: z.enum(["existing", "new"]),
  role: z.enum(["admin", "manager", "customer"]),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  language: z.string().optional().default("en")
});

type FormSchema = z.infer<typeof formSchema>;

interface AddCustomerFormProps {
  onSubmit: (data: AddCustomerFormData) => void;
  loading: boolean;
  onCancel: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onSubmit, loading, onCancel }) => {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [companyOption, setCompanyOption] = useState<"existing" | "new">("new");
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      selectedCompanyId: "",
      companyOption: "new",
      role: "customer",
      address: "",
      city: "",
      country: "",
      industry: "",
      language: "en"
    }
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

  const onFormSubmit = (data: FormSchema) => {
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
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john.doe@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label>Company</Label>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <Button
              type="button"
              variant={companyOption === "new" ? "default" : "outline"}
              onClick={() => handleCompanyOptionChange("new")}
              className="w-full"
            >
              Create New Company
            </Button>
            <Button
              type="button"
              variant={companyOption === "existing" ? "default" : "outline"}
              onClick={() => handleCompanyOptionChange("existing")}
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

        <div className="space-y-2">
          <Label htmlFor="role">User Role</Label>
          <Select defaultValue="customer" onValueChange={(value: "admin" | "manager" | "customer") => setValue("role", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="New York"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register("country")}
              placeholder="United States"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            {...register("industry")}
            placeholder="Technology"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};

export default AddCustomerForm;
