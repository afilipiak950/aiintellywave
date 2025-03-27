
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isSaving: boolean;
  handleSaveProfile: () => void;
}

export const ProfileHeader = ({ isEditing, setIsEditing, isSaving, handleSaveProfile }: ProfileHeaderProps) => {
  return (
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
  );
};
