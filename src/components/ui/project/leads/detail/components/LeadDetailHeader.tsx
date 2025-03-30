
import { ExcelRow } from '../../../../../../types/project';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Facebook, ExternalLink } from 'lucide-react';

interface LeadDetailHeaderProps {
  lead: ExcelRow;
}

const LeadDetailHeader = ({ lead }: LeadDetailHeaderProps) => {
  // Helper functions to extract social media URLs
  const getTwitterUrl = () => lead.row_data["Twitter Url"] || "";
  const getFacebookUrl = () => lead.row_data["Facebook Url"] || "";
  const getWebsite = () => lead.row_data["Website"] || "";
  
  // Consistent method to get LinkedIn URL from various possible fields
  const getLinkedinUrl = () => {
    const possibleFields = [
      "Person Linkedin Url",
      "Linkedin Url", 
      "LinkedIn Url", 
      "linkedin_url", 
      "LinkedInURL", 
      "LinkedIn URL", 
      "LinkedIn Profile",
      "linkedin_profile",
      "LinkedIn"
    ];
    
    for (const field of possibleFields) {
      if (lead.row_data[field]) {
        return lead.row_data[field] as string;
      }
    }
    
    return "";
  };
  
  // Format URL to ensure it has https://
  const formatUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex justify-between items-center"
    >
      <h2 className="text-xl font-bold tracking-tight">Lead/Candidate Details</h2>
      
      <div className="flex gap-2">
        {getLinkedinUrl() && (
          <a 
            href={formatUrl(getLinkedinUrl())}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            title="View LinkedIn Profile"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        
        {getTwitterUrl() && (
          <a 
            href={formatUrl(getTwitterUrl())}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            title="View Twitter Profile"
          >
            <Twitter className="h-4 w-4" />
          </a>
        )}
        
        {getFacebookUrl() && (
          <a 
            href={formatUrl(getFacebookUrl())}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            title="View Facebook Profile"
          >
            <Facebook className="h-4 w-4" />
          </a>
        )}
        
        {getWebsite() && (
          <a 
            href={formatUrl(getWebsite())}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            title="Visit Website"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default LeadDetailHeader;
