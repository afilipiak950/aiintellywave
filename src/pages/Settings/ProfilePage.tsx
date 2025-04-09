
import { useState, useEffect } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { useProfile } from '../../hooks/use-profile';
import SecuritySettings from './SecuritySettings';
import LanguageSettings from './LanguageSettings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ProfilePageProps {
  basePath: string;
  settingsType?: 'profile' | 'security' | 'language';
}

export const ProfilePage = ({ basePath, settingsType = 'profile' }: ProfilePageProps) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    profile,
    setProfile,
    loading,
    isEditing,
    setIsEditing,
    isSaving,
    avatarUrl,
    setAvatarUrl,
    handleSaveProfile,
    getInitials,
    userId,
    loadError
  } = useProfile(setError);

  // Content title based on settings type
  const getContentTitle = () => {
    switch (settingsType) {
      case 'security':
        return 'Security Settings';
      case 'language':
        return 'Language Settings';
      default:
        return 'Your Profile';
    }
  };
  
  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Wrapper for handleSaveProfile that shows success message
  const handleSave = async () => {
    try {
      await handleSaveProfile();
      setSuccessMessage("Your profile has been saved successfully");
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="relative p-6">
        <div className="relative z-10">
          {settingsType === 'profile' && (
            <ProfileHeader 
              isEditing={isEditing} 
              setIsEditing={setIsEditing} 
              isSaving={isSaving}
              handleSaveProfile={handleSave}
              title={getContentTitle()}
            />
          )}
          
          {settingsType !== 'profile' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{getContentTitle()}</h1>
            </div>
          )}

          {(error || loadError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || loadError || "Failed to load user settings. Please try again."}
              </AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {loading && settingsType === 'profile' ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {settingsType === 'profile' && (
                <ProfileCard
                  userId={userId || ''}
                  profile={profile}
                  isEditing={isEditing}
                  avatarUrl={avatarUrl}
                  setProfile={setProfile}
                  getInitials={getInitials}
                  onAvatarUpdated={(url) => setAvatarUrl(url)}
                />
              )}
              
              {settingsType === 'security' && <SecuritySettings />}
              
              {settingsType === 'language' && <LanguageSettings />}
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ProfilePage;
