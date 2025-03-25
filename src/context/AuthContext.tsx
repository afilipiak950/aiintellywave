
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

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
      
      // First, get company user record to determine role
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select('role, company_id, is_admin')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (companyUserError) {
        console.error('Error fetching company user data:', companyUserError);
        throw companyUserError;
      }
      
      console.log('Company user data:', companyUserData);
      
      // Get user profile for additional info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, is_active')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        throw profileError;
      }
      
      console.log('Profile data:', profileData);
      
      // Fetch email from auth.users (via a secure function if needed in production)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }
      
      // Determine roles based on company_users record
      if (companyUserData) {
        const role = companyUserData.role;
        console.log('User role:', role);
        
        setIsAdmin(role === 'admin');
        setIsManager(role === 'manager');
        setIsCustomer(role === 'customer');
        
        const userProfile: UserProfile = {
          id: userId,
          email: user?.email,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          companyId: companyUserData.company_id,
          avatar: profileData?.avatar_url,
          role: role
        };
        
        console.log('Setting user profile:', userProfile);
        setUser(userProfile);
      } else {
        console.warn('No company_users record found for this user');
        setUser({
          id: userId,
          email: user?.email,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          avatar: profileData?.avatar_url
        });
        
        // Set all roles to false if no company_users record
        setIsAdmin(false);
        setIsManager(false);
        setIsCustomer(false);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
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
