
import { Role, User } from '@/types/auth';

export const getUserRole = (user: User | null): Role | undefined => {
  if (!user || !user.roles || user.roles.length === 0) {
    console.log("No user roles found:", user?.roles);
    return undefined;
  }
  
  console.log("Checking roles for user:", user.id, "Roles:", user.roles);
  
  // Return highest priority role
  if (user.roles.includes('admin')) return 'admin';
  if (user.roles.includes('manager')) return 'manager';
  if (user.roles.includes('employee')) return 'employee';
  
  return undefined;
};

export const getUserCompany = (user: User | null): string | undefined => {
  console.log("Getting company for user:", user?.id, "Company:", user?.companyId);
  return user?.companyId;
};

export const checkUserRoles = (user: User | null) => {
  const isAdmin = user?.roles?.includes('admin') || false;
  const isManager = user?.roles?.includes('manager') || false;
  const isEmployee = user?.roles?.includes('employee') || false;
  const isCustomer = isManager || isEmployee; // For backward compatibility

  console.log("User role check result:", { isAdmin, isManager, isEmployee, isCustomer });

  return {
    isAdmin,
    isManager,
    isEmployee,
    isCustomer
  };
};
