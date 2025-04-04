import { z } from 'zod';

export interface CustomerFormSchema {
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "customer";
  address: string;
  city: string;
  country: string;
  industry: string;
  language: string;
  companyOption: "existing" | "new";
  companyName: string;
  selectedCompanyId: string;
  password: string;
  confirmPassword: string;
  isPrimaryCompany: boolean;
}

export const customerFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "customer"]).default("customer"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  language: z.string().default("en"),
  companyOption: z.enum(["existing", "new"]).default("new"),
  companyName: z.string().optional(),
  selectedCompanyId: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const defaultFormValues: CustomerFormSchema = {
  fullName: '',
  email: '',
  phone: '',
  role: 'customer',
  address: '',
  city: '',
  country: '',
  industry: '',
  language: 'en',
  companyOption: 'new',
  companyName: '',
  selectedCompanyId: '',
  password: '',
  confirmPassword: '',
  isPrimaryCompany: false
};
