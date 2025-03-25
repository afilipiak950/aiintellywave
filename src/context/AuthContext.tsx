
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';

type UserRole = 'admin' | 'manager' | 'customer';

type User = {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  companyId?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          try {
            // Get user's role from company_users
            const { data: companyUserData, error: companyUserError } = await supabase
              .from('company_users')
              .select('*, companies:company_id(name)')
              .eq('user_id', session.user.id)
              .single();
              
            // Get user profile data
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (companyUserError && companyUserError.code !== 'PGRST116') {
              console.error('Error fetching company user data:', companyUserError);
            }
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching profile data:', profileError);
            }
            
            // If no company user record, check user_roles
            let role: UserRole = 'customer'; // Default role
            let companyId: string | undefined = undefined;
            
            if (companyUserData) {
              role = companyUserData.role as UserRole;
              companyId = companyUserData.company_id;
            } else {
              // Fall back to user_roles table
              const { data: userRoleData, error: userRoleError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
              if (userRoleError && userRoleError.code !== 'PGRST116') {
                console.error('Error fetching user role:', userRoleError);
              }
              
              if (userRoleData) {
                role = userRoleData.role as UserRole;
              }
            }
            
            const updatedUser = {
              id: session.user.id,
              email: session.user.email || '',
              role,
              firstName: profileData?.first_name || '',
              lastName: profileData?.last_name || '',
              avatar: profileData?.avatar_url || '',
              companyId,
            };
            
            console.log('Auth state updated:', updatedUser);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch (error) {
            console.error('Error processing auth state change:', error);
            setUser(null);
            localStorage.removeItem('user');
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
      // The auth change handler will handle setting the user if a session exists
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('user');
      }
    }
    
    if (!isLoading) return;
    
    // If we're still loading and have no stored user, check for a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // User will be set by the auth state change listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Add user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: data.user.id, role }]);
          
        if (roleError) {
          throw roleError;
        }
      }
      
      // User will be set by the auth state change listener
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isManager,
        isCustomer,
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
