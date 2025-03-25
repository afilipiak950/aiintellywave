
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

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
    console.log("Setting up auth state change listener");
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setIsLoading(true);
        
        if (session?.user) {
          try {
            console.log("User is authenticated, fetching additional data");
            
            // Get user's role from company_users
            const { data: companyUserData, error: companyUserError } = await supabase
              .from('company_users')
              .select('*, companies:company_id(name)')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            // Get user profile data
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (companyUserError) {
              console.error('Error fetching company user data:', companyUserError);
            }
            
            if (profileError) {
              console.error('Error fetching profile data:', profileError);
            }
            
            // If no company user record, check user_roles
            let role: UserRole = 'customer'; // Default role
            let companyId: string | undefined = undefined;
            
            if (companyUserData) {
              role = companyUserData.role as UserRole;
              companyId = companyUserData.company_id;
              console.log("Found role in company_users:", role);
            } else {
              console.log("No company user data, checking user_roles");
              // Fall back to user_roles table
              const { data: userRoleData, error: userRoleError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
                
              if (userRoleError) {
                console.error('Error fetching user role:', userRoleError);
              }
              
              if (userRoleData) {
                role = userRoleData.role as UserRole;
                console.log("Found role in user_roles:", role);
              } else {
                console.log("No role found in user_roles, using default:", role);
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
            
            console.log('User data resolved:', updatedUser);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch (error) {
            console.error('Error processing auth state change:', error);
            setUser(null);
            localStorage.removeItem('user');
          }
        } else {
          console.log("No active session, clearing user");
          setUser(null);
          localStorage.removeItem('user');
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Checked initial session:", session?.user?.id ? "Found" : "Not found");
      
      if (!session) {
        console.log("No initial session found");
        setIsLoading(false);
      }
      // The auth change handler will handle setting the user if a session exists
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log("Checking for stored user data");
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Found stored user data:", parsedUser.email);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Login attempt for:", email);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }
      
      console.log("Login successful - auth state change will update user data");
      
      // User will be set by the auth state change listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    console.log("Registration attempt for:", email, "with role:", role);
    setIsLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error("Registration error:", error.message);
        throw error;
      }
      
      if (data.user) {
        console.log("User created, setting role");
        // Add user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: data.user.id, role }]);
          
        if (roleError) {
          console.error("Error setting user role:", roleError.message);
          throw roleError;
        }
        
        console.log("Role set successfully");
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
    console.log("Logging out");
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      localStorage.removeItem('user');
      console.log("Logout successful");
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
