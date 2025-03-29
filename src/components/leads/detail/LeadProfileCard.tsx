
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building, Linkedin, Twitter, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import { Lead } from "@/types/lead";
import { getSocialProfiles } from "./LeadDetailUtils";

interface LeadProfileCardProps {
  lead: Lead;
  getInitials: () => string;
}

const LeadProfileCard = ({ lead, getInitials }: LeadProfileCardProps) => {
  const socialProfiles = getSocialProfiles(lead);
  
  // Map for icon components
  const socialIcons = {
    linkedin: <Linkedin className="h-3.5 w-3.5" />,
    twitter: <Twitter className="h-3.5 w-3.5" />,
    facebook: <Facebook className="h-3.5 w-3.5" />
  };
  
  // Map for icon background colors
  const socialColors = {
    linkedin: "bg-[#0077B5]",
    twitter: "bg-[#1DA1F2]", 
    facebook: "bg-[#1877F2]"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex items-center gap-4 px-6 py-4 border-b"
    >
      <Avatar className="h-16 w-16">
        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{lead.name}</h2>
          
          {/* Social Icons */}
          <div className="flex -space-x-1">
            {socialProfiles.slice(0, 3).map((profile, index) => {
              // Only show the top 3 social profiles in the header
              if (!socialIcons[profile.network as keyof typeof socialIcons]) return null;
              
              return (
                <a 
                  key={index}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className={`inline-flex items-center justify-center w-6 h-6 ${socialColors[profile.network as keyof typeof socialColors]} text-white rounded-full hover:opacity-90 transition-opacity`}
                  title={`View ${profile.network.charAt(0).toUpperCase() + profile.network.slice(1)} Profile`}
                >
                  {socialIcons[profile.network as keyof typeof socialIcons]}
                </a>
              );
            })}
            
            {socialProfiles.length > 3 && (
              <div className="inline-flex items-center justify-center w-6 h-6 bg-gray-400 text-white rounded-full text-xs font-medium">
                +{socialProfiles.length - 3}
              </div>
            )}
          </div>
        </div>
        
        {lead.position && (
          <p className="text-muted-foreground">{lead.position}</p>
        )}
        
        {lead.company && (
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Building className="h-3.5 w-3.5 mr-1" />
            <span>{lead.company}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LeadProfileCard;
