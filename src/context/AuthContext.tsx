
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Role = 'admin' | 'manager' | 'employee';

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  roles: Role[];
  companyId?: string;
};

type AuthContextType = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await fetchUserData(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) throw rolesError;
      
      // Get company association
      const { data: companyUser, error: companyError } = await supabase
        .from('company_users')
        .select('company_id, role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (companyError) throw companyError;
      
      // Get user auth data
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) throw authError;
      
      // Combine roles from user_roles and company_users
      const userRoleValues = userRoles.map(r => r.role as Role);
      
      // Add role from company_users if exists
      if (companyUser?.role) {
        userRoleValues.push(companyUser.role as Role);
      }
      
      // Construct user object
      const userData: User = {
        id: userId,
        email: authUser.user.email || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        avatar: profile?.avatar_url || '',
        isActive: profile?.is_active !== false, // Default to true if null/undefined
        roles: userRoleValues,
        companyId: companyUser?.company_id,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user data:', error);
      // For any error, we'll clear the session to be safe
      setUser(null);
      localStorage.removeItem('user');
      toast({
        title: "Authentication Error",
        description: "Could not retrieve user information. Please log in again.",
        variant: "destructive"
      });
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        await fetchUserData(data.user.id);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role: 'admin' | 'customer') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // For new Users, we'll set up their role
        const userId = data.user.id;
        
        // Add an admin role if requested
        if (role === 'admin') {
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' });
        }
        
        await fetchUserData(userId);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const getUserRole = (): Role | undefined => {
    if (!user || !user.roles || user.roles.length === 0) return undefined;
    
    // Return highest priority role
    if (user.roles.includes('admin')) return 'admin';
    if (user.roles.includes('manager')) return 'manager';
    if (user.roles.includes('employee')) return 'employee';
    
    return undefined;
  };

  const getUserCompany = (): string | undefined => {
    return user?.companyId;
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('admin') || false;
  const isManager = user?.roles?.includes('manager') || false;
  const isEmployee = user?.roles?.includes('employee') || false;
  const isCustomer = isManager || isEmployee; // For backward compatibility

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isManager,
        isEmployee,
        isCustomer,
        getUserRole,
        getUserCompany,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
