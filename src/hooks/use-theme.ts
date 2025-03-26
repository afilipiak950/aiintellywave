
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { UserSettings } from '@/services/types/settingsTypes';

export const useTheme = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<UserSettings['theme']>('light');
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  // Function to apply theme to document
  const applyTheme = (newTheme: UserSettings['theme']) => {
    const resolvedTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Initialize theme from user settings or localStorage
  useEffect(() => {
    const initTheme = async () => {
      setIsLoading(true);
      let savedTheme: UserSettings['theme'] = 'light';
      
      // Try to get theme from user settings in database
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('theme')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!error && data && data.theme) {
            savedTheme = data.theme as UserSettings['theme'];
          }
        } catch (error) {
          console.error('Error loading theme from database:', error);
        }
      }
      
      // If no database setting, try localStorage
      if (savedTheme === 'light') {
        const localTheme = localStorage.getItem('theme') as UserSettings['theme'] | null;
        if (localTheme) {
          savedTheme = localTheme;
        }
      }
      
      setTheme(savedTheme);
      applyTheme(savedTheme);
      setIsLoading(false);
    };
    
    initTheme();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [user]);
  
  // Function to update theme
  const updateTheme = async (newTheme: UserSettings['theme']) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Save to localStorage as fallback
    localStorage.setItem('theme', newTheme);
    
    // Save to database if user is logged in
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Update existing record
          await supabase
            .from('user_settings')
            .update({ theme: newTheme })
            .eq('id', data.id);
        } else {
          // Insert new record
          await supabase
            .from('user_settings')
            .insert({ user_id: user.id, theme: newTheme });
        }
      } catch (error) {
        console.error('Error saving theme to database:', error);
      }
    }
  };
  
  return { theme, updateTheme, isLoading };
};
