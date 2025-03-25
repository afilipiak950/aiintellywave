
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  email: string;
  role: 'admin' | 'customer';
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
  isCustomer: boolean;
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
    setIsLoading(false);
  }, []);

  // Mock authentication functions (will be replaced with Supabase)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be a call to Supabase auth.signIn
      // For now, let's simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      
      // Dummy user for demonstration, will be replaced with actual Supabase auth
      const mockUser = {
        id: '1',
        email,
        role: email.includes('admin') ? 'admin' : 'customer',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://i.pravatar.cc/150?u=' + email,
        companyId: email.includes('admin') ? undefined : '1',
      } as User;
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role: 'admin' | 'customer') => {
    setIsLoading(true);
    try {
      // This would be a call to Supabase auth.signUp
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      
      // Simulate successful registration
      const mockUser = {
        id: '2',
        email,
        role,
        firstName: '',
        lastName: '',
        avatar: 'https://i.pravatar.cc/150?u=' + email,
        companyId: role === 'customer' ? '2' : undefined,
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // This would be a call to Supabase auth.signOut
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
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
