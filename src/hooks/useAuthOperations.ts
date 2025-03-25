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
      console.log("Starte Login-Prozess für:", email);
      
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
          console.log("Benutzerdaten erfolgreich geladen:", userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Handle redirection based on user role
          if (userData.roles?.includes('admin')) {
            console.log("Admin user detected, redirecting to admin dashboard");
            setTimeout(() => {
              window.location.href = '/admin/dashboard';
            }, 500);
          } else {
            console.log("Regular user detected, redirecting to customer dashboard");
            setTimeout(() => {
              window.location.href = '/customer/dashboard';
            }, 500);
          }
          
          return userData;
        } else {
          console.error("Konnte keine Benutzerdaten abrufen!");
          throw new Error("Keine Benutzerdaten gefunden");
        }
      } else {
        console.error("Kein Benutzer in der Antwort von Supabase Auth");
        throw new Error("Anmeldung fehlgeschlagen");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      console.log("Login-Prozess abgeschlossen, setze isLoading auf false");
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
    try {
      console.log("Starte Logout-Prozess");
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      console.log("Logout erfolgreich, leite zur Login-Seite weiter");
      window.location.href = '/login';
    } catch (error) {
      console.error("Fehler beim Logout:", error);
      toast.error("Fehler beim Abmelden. Bitte versuchen Sie es erneut.");
    }
  };

  return {
    login,
    register,
    logout
  };
};
