
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Mail, Phone, Globe, MapPin, ExternalLink } from 'lucide-react';

interface ContactCardProps {
  lead: Lead;
}

const ContactCard = ({ lead }: ContactCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-base font-semibold mb-3 flex items-center">
        <Mail className="h-4 w-4 mr-2 text-blue-500" />
        Contact Information
      </h3>
      <div className="space-y-3">
        {lead.email && (
          <div className="flex items-center group">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <a 
              href={`mailto:${lead.email}`} 
              className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              {lead.email}
            </a>
          </div>
        )}
        
        {lead.phone && (
          <div className="flex items-center group">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
              <Phone className="h-4 w-4 text-green-500" />
            </div>
            <a 
              href={`tel:${lead.phone}`} 
              className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              {lead.phone}
            </a>
          </div>
        )}
        
        {lead.extra_data?.["Website"] && (
          <div className="flex items-center group">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
              <Globe className="h-4 w-4 text-purple-500" />
            </div>
            <a 
              href={lead.extra_data["Website"].startsWith('http') ? lead.extra_data["Website"] : `https://${lead.extra_data["Website"]}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline flex items-center group-hover:translate-x-0.5 transition-transform"
            >
              {lead.extra_data["Website"]}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
        
        {(lead.extra_data?.["Location"] || lead.extra_data?.["City"] || lead.extra_data?.["Country"]) && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-amber-500" />
            </div>
            <span>
              {[
                lead.extra_data?.["Location"], 
                lead.extra_data?.["City"], 
                lead.extra_data?.["Country"]
              ].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ContactCard;
