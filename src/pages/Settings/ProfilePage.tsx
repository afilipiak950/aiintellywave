
import { useState } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { useProfile } from '../../hooks/use-profile';
import SecuritySettings from './SecuritySettings';
import LanguageSettings from './LanguageSettings';

export interface ProfilePageProps {
  basePath: string;
  settingsType?: 'profile' | 'security' | 'language';
}

export const ProfilePage = ({ basePath, settingsType = 'profile' }: ProfilePageProps) => {
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
    userId
  } = useProfile();

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

  return (
    <SettingsLayout basePath={basePath}>
      <div className="relative p-6">
        <div className="relative z-10">
          {settingsType === 'profile' && (
            <ProfileHeader 
              isEditing={isEditing} 
              setIsEditing={setIsEditing} 
              isSaving={isSaving}
              handleSaveProfile={handleSaveProfile}
              title={getContentTitle()}
            />
          )}
          
          {settingsType !== 'profile' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{getContentTitle()}</h1>
            </div>
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
