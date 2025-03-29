
import { ExcelRow } from '../../../../../../types/project';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeadProfileProps {
  lead: ExcelRow;
}

const LeadProfile = ({ lead }: LeadProfileProps) => {
  // Helper functions to extract common fields
  const getName = () => lead.row_data["Name"] || lead.row_data["First Name"] + " " + lead.row_data["Last Name"] || "Unknown";
  const getTitle = () => lead.row_data["Title"] || "";
  
  // Get profile photo URL from various possible fields
  const getProfilePhotoUrl = () => {
    const photoFields = [
      "LinkedIn Photo", "linkedin_photo", "profile_photo", "photo_url", 
      "avatar_url", "photo", "image_url", "headshot_url", "picture"
    ];
    
    for (const field of photoFields) {
      if (lead.row_data[field]) {
        const url = lead.row_data[field] as string;
        if (url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('www.'))) {
          return url;
        }
      }
    }
    
    return null;
  };
  
  // Get initials for avatar
  const getInitials = () => {
    const name = getName();
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };

  const photoUrl = getProfilePhotoUrl();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex items-center gap-4 mb-4"
    >
      <Avatar className="h-16 w-16 rounded-full border-2 border-primary/20 shadow-md">
        {photoUrl ? (
          <AvatarImage src={photoUrl} alt={`${getName()}'s photo`} className="object-cover" />
        ) : null}
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div>
        <h2 className="text-xl font-semibold">{getName()}</h2>
        {getTitle() && <p className="text-muted-foreground">{getTitle()}</p>}
      </div>
    </motion.div>
  );
};

export default LeadProfile;
