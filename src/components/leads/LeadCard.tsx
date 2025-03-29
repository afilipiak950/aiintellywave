
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import LeadStatusBadge from './LeadStatusBadge';
import { Building, Calendar, Mail, Phone, User, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import LeadScoreIndicator from './LeadScoreIndicator';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  index: number;
}

const LeadCard = ({ lead, onClick, index }: LeadCardProps) => {
  // Check if lead has extra dynamic fields
  const extraFields = lead.extra_data ? Object.entries(lead.extra_data) : [];
  const hasExtraFields = extraFields.length > 0;
  
  // Select up to 2 important extra fields to show (if space permits)
  const highlightedExtraFields = extraFields.slice(0, 2);
  
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="h-full"
    >
      <Card 
        onClick={() => onClick(lead)}
        className="cursor-pointer h-full transition-all duration-300 hover:shadow-md overflow-hidden border"
      >
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <h3 className="font-medium text-base leading-tight">{lead.name}</h3>
            {lead.company && (
              <p className="text-sm text-muted-foreground">{lead.company}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <LeadStatusBadge status={lead.status} />
            <LeadScoreIndicator score={lead.score || 0} />
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            {lead.position && (
              <div className="flex items-center text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                {lead.position}
              </div>
            )}
            
            {lead.email && (
              <div className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <span className="truncate max-w-[200px]">{lead.email}</span>
              </div>
            )}
            
            {lead.phone && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                {lead.phone}
              </div>
            )}
            
            {/* Display up to 2 important extra fields if available */}
            {hasExtraFields && highlightedExtraFields.map(([key, value]) => (
              <div key={key} className="flex items-center text-muted-foreground">
                <Plus className="mr-2 h-4 w-4" />
                <span className="font-medium mr-1">{key}:</span>
                <span className="truncate max-w-[150px]">{String(value)}</span>
              </div>
            ))}
            
            {/* Show indicator if there are more extra fields */}
            {extraFields.length > 2 && (
              <div className="flex items-center text-muted-foreground text-xs italic">
                <Plus className="mr-2 h-3 w-3" />
                {extraFields.length - 2} more field{extraFields.length - 2 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-1 pb-3 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-3 w-3" />
            {getRelativeTime(lead.created_at)}
            
            {lead.project_name && (
              <>
                <span className="mx-2">•</span>
                <Building className="mr-2 h-3 w-3" />
                {lead.project_name}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LeadCard;
