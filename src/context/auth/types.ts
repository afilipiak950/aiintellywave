
import { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyId?: string;
  avatar?: string;
  role?: string; // Changed from enum to string
  is_admin?: boolean;
  is_manager?: boolean;
  is_customer?: boolean;
  // Add user_metadata field
  user_metadata?: {
    role?: string; // Changed from enum to string
    [key: string]: any;
  };
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data?: {
      user: User | null;
      session: Session | null;
    };
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data?: {
      user: User | null;
      session: Session | null;
    };
  }>;
  signOut: () => Promise<void>;
}
