
import SettingsLayout from '../../components/settings/SettingsLayout';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { useProfile } from '../../hooks/use-profile';

export interface ProfilePageProps {
  basePath: string;
}

export const ProfilePage = ({ basePath }: ProfilePageProps) => {
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

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <ProfileHeader 
          isEditing={isEditing} 
          setIsEditing={setIsEditing} 
          isSaving={isSaving}
          handleSaveProfile={handleSaveProfile}
        />
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <ProfileCard
              userId={userId || ''}
              profile={profile}
              isEditing={isEditing}
              avatarUrl={avatarUrl}
              setProfile={setProfile}
              getInitials={getInitials}
              onAvatarUpdated={(url) => setAvatarUrl(url)}
            />
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default ProfilePage;
