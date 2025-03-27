
import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../hooks/use-toast';

interface AvatarUploaderProps {
  userId: string;
  avatarUrl: string | null;
  isEditing: boolean;
  getInitials: () => string;
  onAvatarUpdated: (url: string) => void;
}

export const AvatarUploader = ({ 
  userId, 
  avatarUrl, 
  isEditing, 
  getInitials, 
  onAvatarUpdated 
}: AvatarUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !userId) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
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
        
      const newAvatarUrl = urlData.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      onAvatarUpdated(newAvatarUrl);
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

  return (
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
  );
};
