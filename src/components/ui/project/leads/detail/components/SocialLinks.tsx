
import { ExcelRow } from '../../../../../../types/project';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Linkedin, Twitter, Facebook } from 'lucide-react';

interface SocialLinksProps {
  lead: ExcelRow;
}

const SocialLinks = ({ lead }: SocialLinksProps) => {
  // Helper functions to extract common fields
  const getFacebookUrl = () => lead.row_data["Facebook Url"] || "";
  const getTwitterUrl = () => lead.row_data["Twitter Url"] || "";
  
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

  // Handle link opening
  const handleOpenLink = (url: string) => {
    if (!url) return;
    window.open(formatUrl(url), '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex gap-2 flex-wrap">
        {getLinkedinUrl() && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => handleOpenLink(getLinkedinUrl())}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
        )}
        
        {getTwitterUrl() && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => handleOpenLink(getTwitterUrl())}
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>
        )}
        
        {getFacebookUrl() && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => handleOpenLink(getFacebookUrl())}
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default SocialLinks;
