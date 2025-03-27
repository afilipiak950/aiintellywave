
import { User, Mail, Briefcase } from 'lucide-react';
import { ProfileTextField } from './form/ProfileTextField';
import { ProfileReadOnlyField } from './form/ProfileReadOnlyField';
import { ProfileTextArea } from './form/ProfileTextArea';

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
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  return (
    <div className="space-y-6 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileTextField
          id="firstName"
          label="First Name"
          value={profile.firstName}
          isEditing={isEditing}
          icon={<User className="mr-2 h-4 w-4 text-gray-500" />}
          onChange={handleChange('firstName')}
        />
        
        <ProfileTextField
          id="lastName"
          label="Last Name"
          value={profile.lastName}
          isEditing={isEditing}
          icon={<User className="mr-2 h-4 w-4 text-gray-500" />}
          onChange={handleChange('lastName')}
        />
        
        <ProfileReadOnlyField
          id="email"
          label="Email"
          value={profile.email}
          icon={<Mail className="mr-2 h-4 w-4 text-gray-500" />}
        />
        
        <ProfileTextField
          id="position"
          label="Position"
          value={profile.position}
          isEditing={isEditing}
          icon={<Briefcase className="mr-2 h-4 w-4 text-gray-500" />}
          onChange={handleChange('position')}
        />
        
        <div className="md:col-span-2">
          <ProfileTextField
            id="displayName"
            label="Display Name"
            value={profile.displayName}
            isEditing={isEditing}
            icon={<User className="mr-2 h-4 w-4 text-gray-500" />}
            onChange={handleChange('displayName')}
          />
        </div>
        
        <div className="md:col-span-2">
          <ProfileTextArea
            id="bio"
            label="Bio"
            value={profile.bio}
            isEditing={isEditing}
            onChange={handleChange('bio')}
          />
        </div>
      </div>
    </div>
  );
};
