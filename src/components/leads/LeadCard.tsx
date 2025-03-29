
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import { motion } from 'framer-motion';
import LeadStatusBadge from './LeadStatusBadge';
import { Mail, Phone, Briefcase, Building2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  index: number;
}

// Using memo to prevent unnecessary re-renders
const LeadCard = memo(({ lead, onClick, index }: LeadCardProps) => {
  const dateFormatted = lead.created_at 
    ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })
    : 'Unknown date';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      className="h-full"
    >
      <Card 
        className="cursor-pointer h-full hover:bg-gray-50 dark:hover:bg-gray-800 border overflow-hidden transition-all duration-300"
        onClick={() => onClick(lead)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg line-clamp-1">{lead.name || 'Unnamed Lead'}</h3>
            <LeadStatusBadge status={lead.status} />
          </div>
          
          {lead.company && (
            <div className="flex items-center mb-2 text-gray-700 dark:text-gray-300">
              <Building2 className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm line-clamp-1">{lead.company}</span>
            </div>
          )}
          
          {lead.position && (
            <div className="flex items-center mb-2 text-gray-700 dark:text-gray-300">
              <Briefcase className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm line-clamp-1">{lead.position}</span>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center mb-2 text-gray-700 dark:text-gray-300">
              <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm line-clamp-1">{lead.email}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center mb-2 text-gray-700 dark:text-gray-300">
              <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm line-clamp-1">{lead.phone}</span>
            </div>
          )}
          
          {lead.created_at && (
            <div className="flex items-center mt-4 pt-2 border-t text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Added {dateFormatted}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

LeadCard.displayName = 'LeadCard';

export default LeadCard;
