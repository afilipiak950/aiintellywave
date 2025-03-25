
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '../hooks/use-toast';

interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyId?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('AuthProvider initialized');
    // Set up session listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? session.user?.id : 'No session');
      setSession(session);
      
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        // Clear user data when session is null
        setUser(null);
        setIsAdmin(false);
        setIsManager(false);
        setIsCustomer(false);
        setIsLoading(false);
      }
    });

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching user profile for:', userId);
      
      // First, try to get user role directly using our new secure function
      const { data: roleData, error: roleError } = await supabase.rpc(
        'get_user_role',
        { user_id: userId }
      );
      
      if (roleError) {
        console.warn('Error fetching role with RPC function:', roleError);
        // Don't throw, we'll try the direct query as fallback
      } else {
        console.log('Role data from RPC function:', roleData);
      }
      
      // If RPC fails or returns null, try direct query as fallback
      let userRole = roleData;
      let companyId: string | undefined;
      
      if (!userRole) {
        // Direct query to company_users as fallback
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select('role, company_id, is_admin')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (companyUserError) {
          console.error('Error fetching company user data:', companyUserError);
          // We'll attempt to continue with user profile without role
        } else if (companyUserData) {
          console.log('Company user data from direct query:', companyUserData);
          userRole = companyUserData.role;
          companyId = companyUserData.company_id;
        } else {
          console.warn('No company_users record found via direct query');
        }
      }
      
      // Get user profile for additional info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, is_active')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        // Continue with partial data rather than throwing
      } else {
        console.log('Profile data:', profileData);
      }
      
      // Fetch email from auth.users
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        // Continue with partial data rather than throwing
      }
      
      // Determine roles based on the role we got
      if (userRole) {
        console.log('User role determined:', userRole);
        
        setIsAdmin(userRole === 'admin');
        setIsManager(userRole === 'manager');
        setIsCustomer(userRole === 'customer');
        
        const userProfile: UserProfile = {
          id: userId,
          email: user?.email,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          companyId: companyId,
          avatar: profileData?.avatar_url,
          role: userRole
        };
        
        console.log('Setting user profile:', userProfile);
        setUser(userProfile);
      } else {
        // If no role found but we have a user, set a default role
        console.warn('No role found for user, setting as customer by default');
        setUser({
          id: userId,
          email: user?.email,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          avatar: profileData?.avatar_url,
          role: 'customer' // Default role when none is found
        });
        
        // Set customer role as default
        setIsAdmin(false);
        setIsManager(false);
        setIsCustomer(true);
        
        // If this was the first attempt, try one more time after a short delay
        if (retryCount < 1) {
          console.log('Will retry fetching role once more after delay');
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchUserProfile(userId), 2000);
          return; // Exit early, we'll try again
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Set default role on error
      setIsAdmin(false);
      setIsManager(false);
      setIsCustomer(true);
      toast({
        title: "Fehler beim Laden des Benutzerprofils",
        description: "Standardrolle (Kunde) wurde zugewiesen.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('Login attempt result:', result);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as Error, data: { user: null, session: null } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      return await supabase.auth.signUp({ email, password });
    } catch (error) {
      return { error: error as Error, data: { user: null, session: null } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setIsManager(false);
      setIsCustomer(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    isAuthenticated: !!session,
    isAdmin,
    isManager,
    isCustomer,
    isLoading,
    user,
    session,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
