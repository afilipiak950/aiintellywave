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
        toast.error("Login failed: " + error.message);
        setIsLoading(false);
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
          
          // Force navigation with a small delay to ensure state is updated
          setTimeout(() => {
            if (isAdmin) {
              console.log("Admin user detected, redirecting to admin dashboard");
              window.location.href = '/admin/dashboard';
            } else {
              console.log("Regular user detected, redirecting to customer dashboard");
              window.location.href = '/customer/dashboard';
            }
            // Keep loading state true since we're redirecting
          }, 200);
          
          return userData;
        } else {
          console.error("Could not retrieve user data!");
          toast.error("Could not retrieve user information");
          setIsLoading(false);
          throw new Error("No user data found");
        }
      } else {
        console.error("No user in Supabase Auth response");
        toast.error("Login failed");
        setIsLoading(false);
        throw new Error("Login failed");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
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
