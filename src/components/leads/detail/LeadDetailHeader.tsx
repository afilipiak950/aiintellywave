
import { Linkedin, Twitter, Facebook, ExternalLink } from 'lucide-react';
import { motion } from "framer-motion";
import { Lead } from '@/types/lead';
import { getSocialProfiles, getLinkedInUrlFromLead } from './LeadDetailUtils';

interface LeadDetailHeaderProps {
  lead: Lead; 
  getLinkedInUrl: () => string | null;
}

const LeadDetailHeader = ({ lead, getLinkedInUrl }: LeadDetailHeaderProps) => {
  const socialProfiles = getSocialProfiles(lead);
  const linkedInUrl = getLinkedInUrl();
  
  // Map for icon components
  const socialIcons = {
    linkedin: <Linkedin className="h-4 w-4" />,
    twitter: <Twitter className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
    >
      <h2 className="text-xl font-bold tracking-tight">Lead Details</h2>
      
      <div className="flex gap-2">
        {linkedInUrl && (
          <a 
            href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            title="View LinkedIn Profile"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}

        {socialProfiles.slice(0, 3).map((profile, index) => {
          // Skip LinkedIn if we already have a dedicated LinkedIn button
          if (linkedInUrl && profile.network === 'linkedin') return null;
          
          if (!socialIcons[profile.network as keyof typeof socialIcons]) return null;
          
          return (
            <a 
              key={index}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
              title={`View ${profile.network.charAt(0).toUpperCase() + profile.network.slice(1)} Profile`}
            >
              {socialIcons[profile.network as keyof typeof socialIcons]}
            </a>
          );
        })}
        
        {lead.website && (
          <a 
            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            title="Visit website"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default LeadDetailHeader;
