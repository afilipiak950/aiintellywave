
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import { motion } from 'framer-motion';
import LeadStatusBadge from './LeadStatusBadge';
import LeadScoreIndicator from './LeadScoreIndicator';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  index: number;
}

// Using memo to prevent unnecessary re-renders
const LeadCard = memo(({ lead, onClick, index }: LeadCardProps) => {
  // Stabilize animations with constants 
  const animationProps = {
    whileHover: { y: -4, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  };
  
  return (
    <motion.div
      {...animationProps}
      className="h-full"
      layout
    >
      <Card 
        className="cursor-pointer h-full hover:shadow-md border overflow-hidden transition-all duration-300"
        onClick={() => onClick(lead)}
      >
        <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
          <CardTitle className="text-base font-medium truncate pr-2">
            {lead.name || 'Unnamed Lead'}
          </CardTitle>
          <LeadStatusBadge status={lead.status} />
        </CardHeader>
        <CardContent className="p-4 pt-1">
          {lead.company && (
            <div className="text-sm text-gray-700 font-medium mb-2 truncate">
              {lead.company}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-1">
            {lead.position && (
              <div className="text-xs text-gray-600 truncate">
                <span className="text-gray-400 mr-1">Position:</span> {lead.position}
              </div>
            )}
            {lead.email && (
              <div className="text-xs text-gray-600 truncate">
                <span className="text-gray-400 mr-1">Email:</span> {lead.email}
              </div>
            )}
            {lead.phone && (
              <div className="text-xs text-gray-600 truncate">
                <span className="text-gray-400 mr-1">Phone:</span> {lead.phone}
              </div>
            )}
            {lead.project_name && (
              <div className="text-xs text-gray-600 truncate">
                <span className="text-gray-400 mr-1">Project:</span> {lead.project_name}
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <LeadScoreIndicator score={lead.score} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

LeadCard.displayName = 'LeadCard';

export default LeadCard;
