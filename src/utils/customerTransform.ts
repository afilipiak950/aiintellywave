
import { Customer } from '@/hooks/customers/types';
import { UICustomer, CompanyData, UserData } from '@/types/customer';

export function transformCompaniesToCustomers(
  companiesData: CompanyData[],
  usersByCompany: Record<string, UserData[]>
): Customer[] {
  return companiesData.map(company => ({
    id: company.id,
    name: company.name,
    company: company.name,
    email: company.contact_email || '',
    phone: company.contact_phone || '',
    status: 'active' as 'active' | 'inactive',
    projects: 0,
    description: company.description,
    contact_email: company.contact_email,
    contact_phone: company.contact_phone,
    city: company.city,
    country: company.country,
    users: usersByCompany[company.id] || []
  }));
}

export function filterCustomersBySearchTerm(
  customers: Customer[],
  searchTerm: string
): Customer[] {
  if (!searchTerm) return customers;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return customers.filter(customer => 
    customer.name.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.contact_email?.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.email?.toLowerCase().includes(lowerCaseSearchTerm)
  );
}
