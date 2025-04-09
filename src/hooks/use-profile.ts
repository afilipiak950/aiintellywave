
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { useUserSettings } from './use-user-settings';
import { toast } from './use-toast';

export const useProfile = (setExternalError?: (error: string | null) => void) => {
  const { user } = useAuth();
  const { settings, updateUserProfile } = useUserSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    displayName: '',
    bio: '',
    position: ''
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setLoadError(null);
      if (setExternalError) setExternalError(null);
      
      try {
        // Fetch profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, position')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) {
          throw profileError;
        }
        
        // Load additional user data from settings
        setProfile({
          firstName: profileData?.first_name || user?.firstName || '',
          lastName: profileData?.last_name || user?.lastName || '',
          email: user?.email || '',
          displayName: settings?.display_name || '',
          bio: settings?.bio || '',
          position: profileData?.position || ''
        });
        
        setAvatarUrl(profileData?.avatar_url || null);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        const errorMessage = "Failed to load profile data. Please try again.";
        setLoadError(errorMessage);
        if (setExternalError) setExternalError(errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadProfile();
    }
  }, [user, settings, setExternalError]);
  
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setLoadError(null);
    if (setExternalError) setExternalError(null);
    
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          position: profile.position
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update display name and bio in settings
      await updateUserProfile({
        display_name: profile.displayName,
        bio: profile.bio
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = "Failed to update profile. Please try again.";
      setLoadError(errorMessage);
      if (setExternalError) setExternalError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile.firstName) {
      return profile.firstName[0].toUpperCase();
    }
    if (profile.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };

  return {
    profile,
    setProfile,
    loading,
    loadError,
    isEditing,
    setIsEditing,
    isSaving,
    avatarUrl,
    setAvatarUrl,
    handleSaveProfile,
    getInitials,
    userId: user?.id
  };
};
