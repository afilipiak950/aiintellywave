
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, AuthContextType } from '@/types/auth';
import { fetchUserData } from '@/hooks/useUserData';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { getUserRole, getUserCompany, checkUserRoles } from '@/utils/authHelpers';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { login, register, logout } = useAuthOperations(setUser, setIsLoading);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log("AuthProvider initialized");
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log("Found stored user data in localStorage");
      setUser(JSON.parse(storedUser));
    }
    
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log("User signed in, fetching user data");
            const userData = await fetchUserData(session.user.id);
            if (userData) {
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing user data");
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    setIsLoading(true);
    
    try {
      console.log("Checking for existing session");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("Found existing session, fetching user data");
        const userData = await fetchUserData(session.user.id);
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        console.log("No existing session found");
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

  const isAuthenticated = !!user;
  const { isAdmin, isManager, isEmployee, isCustomer } = checkUserRoles(user);

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
        getUserRole: () => getUserRole(user),
        getUserCompany: () => getUserCompany(user),
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
