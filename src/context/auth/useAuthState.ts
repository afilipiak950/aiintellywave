
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { useUserProfile } from './useUserProfile';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const { fetchUserProfile } = useUserProfile();

  const handleUserSession = async (userId: string, email?: string | undefined) => {
    setIsLoading(true);
    
    // Special case for admin@intellywave.de
    if (email === 'admin@intellywave.de') {
      console.log('Admin email detected in AuthProvider, setting admin role directly');
      setUser({
        id: userId,
        email: email,
        role: 'admin',
        is_admin: true,
        is_manager: false,
        is_customer: false
      });
      setIsAdmin(true);
      setIsManager(false);
      setIsCustomer(false);
      setIsLoading(false);
      return;
    }
    
    const { user: userProfile, isAdmin: isUserAdmin, isManager: isUserManager, isCustomer: isUserCustomer } = 
      await fetchUserProfile(userId);
    
    // Ensure boolean flags are set on the user profile
    if (userProfile) {
      userProfile.is_admin = isUserAdmin;
      userProfile.is_manager = isUserManager;
      userProfile.is_customer = isUserCustomer;
    }
    
    setUser(userProfile);
    setIsAdmin(isUserAdmin);
    setIsManager(isUserManager);
    setIsCustomer(isUserCustomer);
    setIsLoading(false);
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

  useEffect(() => {
    console.log('AuthProvider initialized');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? session.user?.id : 'No session');
      setSession(session);
      
      if (session) {
        handleUserSession(session.user.id, session.user.email);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsManager(false);
        setIsCustomer(false);
        setIsLoading(false);
      }
    });

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        
        setSession(session);
        
        if (session?.user) {
          await handleUserSession(session.user.id, session.user.email);
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

  return {
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
};
