
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
  const [lastError, setLastError] = useState<string | null>(null);
  const { fetchUserProfile } = useUserProfile();

  // Enhanced user session handler with better navigation
  const handleUserSession = async (userId: string, email?: string | undefined) => {
    setIsLoading(true);
    setLastError(null);
    
    try {
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
      
      // Handle manager emails as a fallback
      if (email && email.includes('manager')) {
        console.log('Manager email detected, setting manager role directly');
        setUser({
          id: userId,
          email: email,
          role: 'manager',
          is_admin: false,
          is_manager: true,
          is_customer: false
        });
        setIsAdmin(false);
        setIsManager(true);
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
    } catch (error: any) {
      console.error('Error in handleUserSession:', error);
      setLastError(error.message || 'Unknown authentication error');
      
      // Check for recursion error
      if (error.message?.includes('infinite recursion') || error.code === 'PGRST116') {
        console.log('Detected recursion error in database policy, using fallback authentication');
        // Store error in localStorage for other components to detect
        localStorage.setItem('auth_policy_error', 'true');
      }
      
      // Fallback to customer role if there was an error
      setUser({
        id: userId,
        email: email || '',
        role: 'customer',
        is_admin: false,
        is_manager: false,
        is_customer: true
      });
      setIsAdmin(false);
      setIsManager(false);
      setIsCustomer(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    localStorage.removeItem('auth_policy_error');
    localStorage.removeItem('searchStrings_error');
    localStorage.removeItem('searchStrings_error_details');
    
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
    console.log('Signout called from useAuthState');
    try {
      setIsLoading(true);
      
      // Clear error state and localStorage errors
      setLastError(null);
      localStorage.removeItem('auth_policy_error');
      localStorage.removeItem('searchStrings_error');
      localStorage.removeItem('searchStrings_error_details');
      
      // Clear state immediately to prevent UI issues
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsManager(false);
      setIsCustomer(false);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error from supabase:', error);
        throw error;
      } else {
        console.log('Sign out successful from supabase');
      }
    } catch (error) {
      console.error('Sign out error in try/catch:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider initialized');
    let mounted = true;
    
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession ? newSession.user?.id : 'No session');
      
      if (!mounted) return;
      
      setSession(newSession);
      
      if (newSession) {
        handleUserSession(newSession.user.id, newSession.user.email);
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
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          await handleUserSession(session.user.id, session.user.email);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
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
    lastError,
    signIn,
    signUp,
    signOut,
  };
};
