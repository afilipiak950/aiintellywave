
import { Customer, UICustomer } from "../hooks/customers/types";

export function adaptCustomerToUICustomer(customer: Customer): UICustomer {
  return {
    id: customer.id,
    name: customer.name,
    status: customer.status === "active" ? "active" : "inactive",
    email: customer.email || customer.contact_email || "",
    company: customer.company_name || customer.company || "",
    avatar: customer.avatar_url
  };
}
