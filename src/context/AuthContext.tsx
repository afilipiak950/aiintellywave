
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
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("Set user from localStorage:", parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem('user');
      }
    }

    // Set up auth state listener FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log("User signed in, fetching user data for ID:", session.user.id);
            try {
              const userData = await fetchUserData(session.user.id);
              if (userData) {
                console.log("User data fetched successfully:", userData);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
              } else {
                console.warn("No user data returned from fetchUserData");
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            } finally {
              setIsLoading(false);
            }
          } else {
            console.warn("No user in session during SIGNED_IN event");
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing user data");
          setUser(null);
          localStorage.removeItem('user');
          setIsLoading(false);
        } else {
          // For other events, make sure to set loading to false
          setIsLoading(false);
        }
      }
    );
    
    // THEN check for existing session
    checkUser();

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
        console.log("Found existing session, fetching user data for ID:", session.user.id);
        try {
          const userData = await fetchUserData(session.user.id);
          if (userData) {
            console.log("User data fetched successfully for existing session:", userData);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.warn("No user data returned from fetchUserData for existing session");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data for existing session:", error);
          setUser(null);
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

  console.log("Auth Context state:", { 
    isAuthenticated, 
    isAdmin, 
    isManager, 
    isEmployee, 
    isCustomer,
    user
  });

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
