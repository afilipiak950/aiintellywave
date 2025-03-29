
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Building } from 'lucide-react';

interface CompanyCardProps {
  lead: Lead;
  visible: boolean;
}

const CompanyCard = ({ lead, visible }: CompanyCardProps) => {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-base font-semibold mb-3 flex items-center">
        <Building className="h-4 w-4 mr-2 text-indigo-500" />
        Company Information
      </h3>
      <div className="space-y-3">
        {lead.company && (
          <div className="flex items-start">
            <span className="text-sm text-muted-foreground w-32">Company:</span>
            <span className="font-medium">{lead.company}</span>
          </div>
        )}
        
        {lead.extra_data?.["Industry"] && (
          <div className="flex items-start">
            <span className="text-sm text-muted-foreground w-32">Industry:</span>
            <span>{lead.extra_data["Industry"]}</span>
          </div>
        )}
        
        {lead.extra_data?.["Company Size"] && (
          <div className="flex items-start">
            <span className="text-sm text-muted-foreground w-32">Company Size:</span>
            <span>{lead.extra_data["Company Size"]}</span>
          </div>
        )}
        
        {lead.extra_data?.["Revenue"] && (
          <div className="flex items-start">
            <span className="text-sm text-muted-foreground w-32">Revenue:</span>
            <span>{lead.extra_data["Revenue"]}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CompanyCard;
