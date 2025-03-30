
import { z } from 'zod';

export const customerFormSchema = z.object({
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

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;

export const defaultFormValues: CustomerFormSchema = {
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
};
