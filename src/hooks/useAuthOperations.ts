
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        if (userData) {
          console.log("Benutzerdaten erfolgreich geladen:", userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Handle redirection based on user role
          if (userData.roles?.includes('admin')) {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/customer/dashboard';
          }
          
          return userData;
        }
      }
      
      return null;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return {
    login,
    register,
    logout
  };
};
