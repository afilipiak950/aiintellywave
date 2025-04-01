
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
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
    
    console.log('Applying theme:', resolvedTheme); // Debug log
    
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = 'hsl(224, 71%, 4%)'; // Explicitly set dark background
      document.documentElement.style.color = 'hsl(213, 31%, 91%)'; // Explicitly set dark text
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = 'hsl(0, 0%, 100%)'; // Explicitly set light background
      document.documentElement.style.color = 'hsl(222.2, 84%, 4.9%)'; // Explicitly set light text
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
            savedTheme = mapThemeValue(data.theme);
          }
        } catch (error) {
          console.error('Error loading theme from database:', error);
        }
      }
      
      // If no database setting, try localStorage
      if (savedTheme === 'light') {
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
          savedTheme = mapThemeValue(localTheme);
        }
      }
      
      console.log('Initial theme:', savedTheme); // Debug log
      
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
  
  // Helper function to map any string to our allowed theme values
  const mapThemeValue = (themeValue: string): UserSettings['theme'] => {
    switch (themeValue) {
      case 'dark':
        return 'dark';
      case 'system':
        return 'system';
      default:
        return 'light'; // Default to light for any unrecognized theme
    }
  };
  
  // Function to update theme
  const updateTheme = async (newTheme: UserSettings['theme']) => {
    console.log('Updating theme to:', newTheme); // Debug log
    
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
