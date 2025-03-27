
import { User, Mail, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileFormProps {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    displayName: string;
    bio: string;
    position: string;
  };
  isEditing: boolean;
  setProfile: (profile: any) => void;
}

export const ProfileForm = ({ profile, isEditing, setProfile }: ProfileFormProps) => {
  return (
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
  );
};
