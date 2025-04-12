
import { useCustomerDetail as useCustomerDetailImplementation, useCustomerSubscription } from './customers/use-customer-detail';

// Re-export the implementation
export const useCustomerDetail = useCustomerDetailImplementation;

// Re-export the subscription hook
export { useCustomerSubscription };
