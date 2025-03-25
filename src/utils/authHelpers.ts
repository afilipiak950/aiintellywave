
import { Role, User } from '@/types/auth';

export const getUserRole = (user: User | null): Role | undefined => {
  if (!user || !user.roles || user.roles.length === 0) {
    console.log("No user roles found:", user?.roles);
    return undefined;
  }
  
  console.log("Checking roles for user:", user.id, "Roles:", user.roles);
  
  // Return highest priority role
  if (user.roles.includes('admin')) {
    console.log("User has admin role");
    return 'admin';
  }
  if (user.roles.includes('manager')) {
    console.log("User has manager role");
    return 'manager';
  }
  if (user.roles.includes('employee')) {
    console.log("User has employee role");
    return 'employee';
  }
  
  console.log("No matching role found");
  return undefined;
};

export const getUserCompany = (user: User | null): string | undefined => {
  console.log("Getting company for user:", user?.id, "Company:", user?.companyId);
  return user?.companyId;
};

export const checkUserRoles = (user: User | null) => {
  if (!user) {
    console.log("checkUserRoles called with null user");
    return {
      isAdmin: false,
      isManager: false,
      isEmployee: false,
      isCustomer: false
    };
  }

  console.log("Checking roles array:", user.roles);
  
  // Ensure we have a roles array, even if empty
  const roles = user.roles || [];
  
  const isAdmin = roles.includes('admin');
  const isManager = roles.includes('manager');
  const isEmployee = roles.includes('employee');
  
  // Changed isCustomer definition to be more accurate - 
  // a customer is a user who is either a manager or employee
  // or doesn't have an admin role (this makes more logical sense)
  const isCustomer = !isAdmin;

  console.log("User role check result:", { isAdmin, isManager, isEmployee, isCustomer });

  return {
    isAdmin,
    isManager,
    isEmployee,
    isCustomer
  };
};
