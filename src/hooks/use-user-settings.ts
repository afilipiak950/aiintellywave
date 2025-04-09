
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
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
  
  // Function to ensure theme is one of the allowed values
  const mapTheme = (theme: string): UserSettings['theme'] => {
    if (theme === 'dark' || theme === 'system') return theme;
    return 'light'; // Default
  };
  
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
        
      if (error) {
        // Special handling for RLS policy violations - likely means the record doesn't exist
        if (error.code === '42501') {
          console.log('Creating default settings for user');
          await createDefaultSettings(user.id);
          return;
        }
        throw error;
      }
      
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
        await createDefaultSettings(user.id);
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
  
  const createDefaultSettings = async (userId: string) => {
    try {
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert({ 
          user_id: userId,
          theme: 'light',
          language: 'en',
          email_notifications: true,
          push_notifications: true
        })
        .select()
        .single();
          
      if (insertError) {
        // If insert also fails, most likely due to permissions
        console.error('Failed to create default settings:', insertError);
        // Try getting the user's profile to populate some data
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', userId)
          .maybeSingle();
          
        // Set default values in state, but don't persist
        setSettings({
          user_id: userId,
          theme: 'light',
          language: 'en',
          email_notifications: true,
          push_notifications: true,
          display_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '',
          bio: ''
        });
        return;
      }
        
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
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };
  
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      if (!settings.id) {
        // If no ID, try to create settings first
        await createDefaultSettings(user.id);
        // If still no ID, update only local state
        if (!settings.id) {
          setSettings(prev => ({ ...prev, ...newSettings }));
          setLoading(false);
          return;
        }
      }
      
      // If newSettings contains theme, ensure it's a valid value
      if (newSettings.theme) {
        newSettings.theme = mapTheme(newSettings.theme);
      }
      
      // Update settings in database
      const { error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', user.id);
        
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
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      if (!settings.id) {
        // If no ID, try to create settings first
        await createDefaultSettings(user.id);
        // If still no ID, update only local state
        if (!settings.id) {
          setSettings(prev => ({ ...prev, ...profileData }));
          setLoading(false);
          return;
        }
      }
      
      // Update settings in database
      const { error } = await supabase
        .from('user_settings')
        .update(profileData)
        .eq('user_id', user.id);
        
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
