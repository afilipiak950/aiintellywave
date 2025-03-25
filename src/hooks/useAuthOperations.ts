import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserData } from './useUserData';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
        return null;
      }
      
      console.log("Supabase Auth Response:", data);
      
      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        console.log("Fetched User Data:", userData);
        
        if (userData) {
          console.log("User data successfully loaded:", userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Check user roles
          const isAdmin = userData.roles?.includes('admin');
          const isManager = userData.roles?.includes('manager');
          const isEmployee = userData.roles?.includes('employee');
          console.log("User roles:", { isAdmin, isManager, isEmployee });
          
          // Determine redirect destination
          let redirectTo = isAdmin ? '/admin/dashboard' : '/customer/dashboard';
          console.log("Will redirect to:", redirectTo);
          
          // Force navigation without using React Router
          window.location.href = redirectTo;
          return userData;
        } else {
          console.error("Could not retrieve user data!");
          toast.error("Could not retrieve user information");
          setIsLoading(false);
          return null;
        }
      } else {
        console.error("No user in Supabase Auth response");
        toast.error("Login failed");
        setIsLoading(false);
        return null;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred: " + (error.message || 'Please try again'));
      setIsLoading(false);
      return null;
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
          
          // Force navigation without using React Router
          window.location.href = role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error("Registration failed: " + (error.message || 'Please try again'));
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
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast.error("Error during logout: " + (error.message || 'Please try again'));
    }
  };

  return {
    login,
    register,
    logout
  };
};
