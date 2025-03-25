
export type Role = 'admin' | 'manager' | 'employee';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  roles: Role[];
  companyId?: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isCustomer: boolean;
  getUserRole: () => Role | undefined;
  getUserCompany: () => string | undefined;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'admin' | 'customer') => Promise<void>;
  logout: () => Promise<void>;
};
