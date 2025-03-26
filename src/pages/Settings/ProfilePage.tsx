
import { useState, useEffect, useRef } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useAuth } from '../../context/auth';
import { supabase } from '../../integrations/supabase/client';
import { useUserSettings } from '../../hooks/use-user-settings';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Camera, Edit, Mail, User, Briefcase } from 'lucide-react';

const ProfilePage = () => {
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
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Fetch profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, position')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) throw profileError;
        
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
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadProfile();
    }
  }, [user, settings]);
  
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
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
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user?.id) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    setUploading(true);
    
    try {
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatarUrl = urlData.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(avatarUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Saving
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 ring-4 ring-gray-200">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt="Profile" />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {getInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {isEditing && (
                      <button
                        onClick={handleAvatarClick}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white"></div>
                        ) : (
                          <Camera className="h-8 w-8 text-white" />
                        )}
                      </button>
                    )}
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={uploadAvatar}
                      accept="image/*"
                      className="hidden"
                      disabled={uploading || !isEditing}
                    />
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        {isEditing ? (
                          <Input
                            id="firstName"
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <User className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{profile.firstName || 'Not set'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        {isEditing ? (
                          <Input
                            id="lastName"
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <User className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{profile.lastName || 'Not set'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          <span>{profile.email}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        {isEditing ? (
                          <Input
                            id="position"
                            value={profile.position}
                            onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <Briefcase className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{profile.position || 'Not set'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        {isEditing ? (
                          <Input
                            id="displayName"
                            value={profile.displayName}
                            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                            placeholder="How you want to be called"
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <span>{profile.displayName || 'Not set'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="bio"
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Tell us about yourself"
                            rows={4}
                          />
                        ) : (
                          <div className="p-3 rounded-md border border-gray-200 bg-gray-50 min-h-[100px]">
                            {profile.bio || 'No bio provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default ProfilePage;
