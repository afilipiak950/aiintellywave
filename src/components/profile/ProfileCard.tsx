
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUploader } from './AvatarUploader';
import { ProfileForm } from './ProfileForm';

interface ProfileCardProps {
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    displayName: string;
    bio: string;
    position: string;
  };
  isEditing: boolean;
  avatarUrl: string | null;
  setProfile: (profile: any) => void;
  getInitials: () => string;
  onAvatarUpdated: (url: string) => void;
}

export const ProfileCard = ({ 
  userId,
  profile, 
  isEditing, 
  avatarUrl, 
  setProfile, 
  getInitials,
  onAvatarUpdated
}: ProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
          <AvatarUploader 
            userId={userId}
            avatarUrl={avatarUrl} 
            isEditing={isEditing} 
            getInitials={getInitials}
            onAvatarUpdated={onAvatarUpdated}
          />
          
          <ProfileForm 
            profile={profile} 
            isEditing={isEditing} 
            setProfile={setProfile} 
          />
        </div>
      </CardContent>
    </Card>
  );
};
