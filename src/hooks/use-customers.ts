
// This file is maintained for backward compatibility
// It re-exports everything from the new modular structure
import { useCustomers } from './customers/use-customers';
export * from './customers/types';
export { useCustomers };
export default useCustomers;
