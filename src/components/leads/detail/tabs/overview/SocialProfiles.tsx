
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Linkedin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatLinkedInUrl } from '../../LeadDetailUtils';

interface SocialProfilesProps {
  lead: Lead;
  linkedInUrl: string | null;
}

const SocialProfiles = ({ lead, linkedInUrl }: SocialProfilesProps) => {
  if (!linkedInUrl && !lead.extra_data?.["Facebook"] && !lead.extra_data?.["Twitter"]) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Social Profiles</h3>
      <div className="flex gap-2 flex-wrap">
        {linkedInUrl && (
          <motion.a
            href={formatLinkedInUrl(linkedInUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-md hover:bg-[#0077B5]/90 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Linkedin className="h-4 w-4" />
            View on LinkedIn
          </motion.a>
        )}
        
        {lead.extra_data?.["Facebook"] && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            asChild
          >
            <a 
              href={lead.extra_data["Facebook"].startsWith('http') ? lead.extra_data["Facebook"] : `https://${lead.extra_data["Facebook"]}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook text-[#1877F2]">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              Facebook
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default SocialProfiles;
