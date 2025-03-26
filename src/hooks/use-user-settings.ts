
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { toast } from './use-toast';
import { UserSettings } from '@/services/types/settingsTypes';

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    user_id: '',
    theme: 'light',
    language: 'en',
    email_notifications: true,
    push_notifications: true,
    display_name: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  
  const fetchSettings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get user settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      // Map theme to ensure it's one of the allowed values
      const mapTheme = (theme: string): UserSettings['theme'] => {
        if (theme === 'dark' || theme === 'system') return theme;
        return 'light'; // Default
      };
      
      // If settings exist, update state
      if (data) {
        setSettings({
          id: data.id,
          user_id: data.user_id,
          theme: mapTheme(data.theme),
          language: data.language || 'en',
          email_notifications: data.email_notifications !== false,
          push_notifications: data.push_notifications !== false,
          display_name: data.display_name || '',
          bio: data.bio || ''
        });
      } else {
        // If no settings, create default settings
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({ 
            user_id: user.id,
            theme: 'light',
            language: 'en',
            email_notifications: true,
            push_notifications: true
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        if (newData) {
          setSettings({
            id: newData.id,
            user_id: newData.user_id,
            theme: mapTheme(newData.theme),
            language: newData.language,
            email_notifications: newData.email_notifications,
            push_notifications: newData.push_notifications,
            display_name: newData.display_name || '',
            bio: newData.bio || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.id || !settings.id) return;
    
    try {
      setLoading(true);
      
      // Update settings in database
      const { error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('id', settings.id);
        
      if (error) throw error;
      
      // Update local state
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfile = async (profileData: { display_name?: string, bio?: string }) => {
    if (!user?.id || !settings.id) return;
    
    try {
      setLoading(true);
      
      // Update settings in database
      const { error } = await supabase
        .from('user_settings')
        .update(profileData)
        .eq('id', settings.id);
        
      if (error) throw error;
      
      // Update local state
      setSettings(prev => ({ ...prev, ...profileData }));
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user?.id]);
  
  return {
    settings,
    loading,
    updateSettings,
    updateUserProfile,
    fetchSettings
  };
};
