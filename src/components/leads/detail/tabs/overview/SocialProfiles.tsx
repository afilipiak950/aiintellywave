
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Linkedin, Twitter, Facebook, Instagram, Github } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getSocialProfiles, SocialNetwork } from '../../LeadDetailUtils';

interface SocialProfilesProps {
  lead: Lead;
  linkedInUrl: string | null;
}

const SocialProfiles = ({ lead, linkedInUrl }: SocialProfilesProps) => {
  const socialProfiles = getSocialProfiles(lead);
  
  // Check if we have any social profiles or a LinkedIn URL
  if (socialProfiles.length === 0 && !linkedInUrl) {
    return null;
  }
  
  // Map of social network types to their respective icons and colors
  const networkConfig: Record<SocialNetwork, { icon: React.ReactNode; bgColor: string; hoverColor: string }> = {
    linkedin: { 
      icon: <Linkedin className="h-4 w-4" />, 
      bgColor: "bg-[#0077B5]", 
      hoverColor: "hover:bg-[#0077B5]/90" 
    },
    twitter: { 
      icon: <Twitter className="h-4 w-4" />, 
      bgColor: "bg-[#1DA1F2]", 
      hoverColor: "hover:bg-[#1DA1F2]/90" 
    },
    facebook: { 
      icon: <Facebook className="h-4 w-4" />, 
      bgColor: "bg-[#1877F2]", 
      hoverColor: "hover:bg-[#1877F2]/90" 
    },
    instagram: { 
      icon: <Instagram className="h-4 w-4" />, 
      bgColor: "bg-[#E4405F]", 
      hoverColor: "hover:bg-[#E4405F]/90" 
    },
    github: { 
      icon: <Github className="h-4 w-4" />, 
      bgColor: "bg-[#333]", 
      hoverColor: "hover:bg-[#333]/90" 
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Social Profiles</h3>
      <div className="flex gap-2 flex-wrap">
        {/* Always show the LinkedIn button if URL is available, regardless of socialProfiles */}
        {linkedInUrl && (
          <motion.a
            href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-md hover:bg-[#0077B5]/90 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </motion.a>
        )}
        
        {/* Show other social profiles */}
        {socialProfiles.map((profile, index) => {
          // Skip LinkedIn if we already have a dedicated LinkedIn button
          if (linkedInUrl && profile.network === 'linkedin') return null;
          
          const config = networkConfig[profile.network];
          
          if (!config) return null;
          
          return (
            <motion.a
              key={index}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 ${config.bgColor} text-white rounded-md ${config.hoverColor} transition-colors`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {config.icon}
              {profile.network.charAt(0).toUpperCase() + profile.network.slice(1)}
            </motion.a>
          );
        })}
        
        {/* For any social networks in extra_data that aren't specifically handled */}
        {lead.extra_data?.["Other Social Networks"] && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              window.open(lead.extra_data?.["Other Social Networks"], "_blank");
            }}
          >
            Other
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default SocialProfiles;
