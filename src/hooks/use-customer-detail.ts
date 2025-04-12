
import { useCustomerDetail as useModernCustomerDetail, useCustomerSubscription } from './customers/use-customer-detail';

// Re-export the modern implementation
export const useCustomerDetail = useModernCustomerDetail;

// Re-export the subscription hook
export { useCustomerSubscription };
