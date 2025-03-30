
import { ExcelRow } from '../../../../../../types/project';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Facebook, ExternalLink } from 'lucide-react';

interface LeadDetailHeaderProps {
  lead: ExcelRow;
}

const LeadDetailHeader = ({ lead }: LeadDetailHeaderProps) => {
  // Helper functions to extract social media URLs
  const getLinkedinUrl = () => lead.row_data["Linkedin Url"] || lead.row_data["LinkedIn Url"] || "";
  const getTwitterUrl = () => lead.row_data["Twitter Url"] || "";
  const getFacebookUrl = () => lead.row_data["Facebook Url"] || "";
  const getWebsite = () => lead.row_data["Website"] || "";
  
  // Handle opening external links
  const handleOpenLink = (url: string) => {
    if (!url) return;
    
    // Add https if not present
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'https://' + url;
    }
    
    window.open(fullUrl, '_blank');
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
            href={getLinkedinUrl().startsWith('http') ? getLinkedinUrl() : `https://${getLinkedinUrl()}`}
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
            href={getTwitterUrl().startsWith('http') ? getTwitterUrl() : `https://${getTwitterUrl()}`}
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
            href={getFacebookUrl().startsWith('http') ? getFacebookUrl() : `https://${getFacebookUrl()}`}
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
            href={getWebsite().startsWith('http') ? getWebsite() : `https://${getWebsite()}`}
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
