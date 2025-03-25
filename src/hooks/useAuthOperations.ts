
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserData } from './useUserData';
import { User } from '@/types/auth';
import { toast } from 'sonner';

export const useAuthOperations = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      console.log("Starting login process for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Supabase Auth Error:", error);
        throw error;
      }
      
      console.log("Supabase Auth Response:", data);
      
      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        console.log("Fetched User Data:", userData);
        
        if (userData) {
          console.log("User data successfully loaded:", userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Check if user has admin role
          const isAdmin = userData.roles?.includes('admin');
          console.log("Is Admin user:", isAdmin);
          
          // Redirect based on user role with no delay
          if (isAdmin) {
            console.log("Admin user detected, redirecting to admin dashboard");
            window.location.href = '/admin/dashboard';
          } else {
            console.log("Regular user detected, redirecting to customer dashboard");
            window.location.href = '/customer/dashboard';
          }
          
          return userData;
        } else {
          console.error("Could not retrieve user data!");
          throw new Error("No user data found");
        }
      } else {
        console.error("No user in Supabase Auth response");
        throw new Error("Login failed");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      // Set loading to false only if we didn't redirect
      // This prevents state updates after component unmount
      setTimeout(() => {
        // Check if we're still on the login page before updating state
        if (window.location.pathname.includes('login')) {
          console.log("Login process finished, setting isLoading to false");
          setIsLoading(false);
        } else {
          console.log("Already redirected, not updating isLoading state");
        }
      }, 100);
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
        
        const userData = await fetchUserData(userId);
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Starting logout process");
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      console.log("Logout successful, redirecting to login page");
      window.location.href = '/login';
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout. Please try again.");
    }
  };

  return {
    login,
    register,
    logout
  };
};
