
import { useState, useEffect } from 'react';
import { Linkedin } from 'lucide-react';
import { motion } from "framer-motion";
import { Lead } from '@/types/lead';
import { getLinkedInUrlFromLead, formatLinkedInUrl } from './LeadDetailUtils';

interface LeadDetailHeaderProps {
  lead: Lead; 
  getLinkedInUrl: () => string | null;
}

const LeadDetailHeader = ({ lead, getLinkedInUrl }: LeadDetailHeaderProps) => {
  const linkedInUrl = getLinkedInUrl();
  
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
            href={formatLinkedInUrl(linkedInUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            title="View LinkedIn Profile"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default LeadDetailHeader;
