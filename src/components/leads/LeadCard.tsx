
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

// Define a function to get a gradient background based on the index
const getCardGradient = (index: number) => {
  const gradients = [
    'bg-gradient-to-tr from-blue-50 to-indigo-50',
    'bg-gradient-to-tr from-purple-50 to-pink-50', 
    'bg-gradient-to-tr from-emerald-50 to-teal-50',
    'bg-gradient-to-tr from-amber-50 to-yellow-50',
    'bg-gradient-to-tr from-rose-50 to-red-50'
  ];
  return gradients[index % gradients.length];
};

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

  // Get the appropriate gradient background for this card
  const gradient = getCardGradient(index);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card 
        onClick={() => onClick(lead)}
        className={`cursor-pointer h-full transition-all duration-300 border-0 hover:shadow-lg overflow-hidden rounded-xl ${gradient}`}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.07)' }}
      >
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 pt-5">
          <div className="space-y-1">
            <h3 className="font-medium text-lg leading-tight text-gray-800">{lead.name}</h3>
            {lead.company && (
              <p className="text-sm text-gray-600">{lead.company}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <LeadStatusBadge status={lead.status} />
            <LeadScoreIndicator score={lead.score || 0} />
          </div>
        </CardHeader>
        
        <CardContent className="pb-2 space-y-3">
          <div className="space-y-2 text-sm">
            {lead.position && (
              <div className="flex items-center text-gray-600">
                <User className="mr-3 h-4 w-4 text-indigo-400" />
                <span className="font-medium">{lead.position}</span>
              </div>
            )}
            
            {lead.email && (
              <div className="flex items-center text-gray-600">
                <Mail className="mr-3 h-4 w-4 text-blue-400" />
                <span className="truncate max-w-[200px] hover:text-blue-600 transition-colors">{lead.email}</span>
              </div>
            )}
            
            {lead.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="mr-3 h-4 w-4 text-green-400" />
                <span>{lead.phone}</span>
              </div>
            )}
            
            {/* Display up to 2 important extra fields if available */}
            {hasExtraFields && highlightedExtraFields.map(([key, value]) => (
              <div key={key} className="flex items-center text-gray-600 group">
                <Plus className="mr-3 h-4 w-4 text-purple-400 group-hover:rotate-90 transition-transform duration-200" />
                <span className="font-medium mr-1">{key}:</span>
                <span className="truncate max-w-[150px] group-hover:text-gray-800 transition-colors">{String(value)}</span>
              </div>
            ))}
            
            {/* Show indicator if there are more extra fields */}
            {extraFields.length > 2 && (
              <div className="flex items-center text-gray-500 text-xs font-medium mt-1 bg-white/50 py-1 px-2 rounded-full w-fit">
                <Plus className="mr-1 h-3 w-3" />
                {extraFields.length - 2} more field{extraFields.length - 2 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-1 pb-4 text-xs text-gray-500 mt-auto border-t border-gray-100">
          <div className="flex items-center">
            <Calendar className="mr-2 h-3 w-3" />
            {getRelativeTime(lead.created_at)}
            
            {lead.project_name && (
              <>
                <span className="mx-2">•</span>
                <Building className="mr-2 h-3 w-3" />
                <span className="truncate max-w-[100px]">{lead.project_name}</span>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LeadCard;
