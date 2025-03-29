
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { Lead } from "@/types/lead";
import { formatLinkedInUrl, getLinkedInUrlFromLead } from "./LeadDetailUtils";

interface LeadProfileCardProps {
  lead: Lead;
  getInitials: () => string;
}

const LeadProfileCard = ({ lead, getInitials }: LeadProfileCardProps) => {
  const linkedInUrl = getLinkedInUrlFromLead(lead);
  
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
          
          {linkedInUrl && (
            <a 
              href={formatLinkedInUrl(linkedInUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 bg-[#0077B5] text-white rounded-full hover:opacity-90 transition-opacity"
              title="View LinkedIn Profile"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          )}
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
