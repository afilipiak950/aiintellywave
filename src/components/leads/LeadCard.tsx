
import { motion } from 'framer-motion';
import { Lead } from '@/types/lead';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Building, ExternalLink, Table } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge';
import LeadScoreIndicator from './LeadScoreIndicator';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  index: number;
}

export const LeadCard = ({ lead, onClick, index }: LeadCardProps) => {
  // Check if lead is from excel data
  const isExcelLead = lead.hasOwnProperty('excel_data');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card 
        className={`h-full cursor-pointer backdrop-blur-sm border-t-4 hover:shadow-md transition-shadow ${isExcelLead ? 'bg-green-50/80' : 'bg-white/80'}`}
        style={{ borderTopColor: getProjectColor(lead.project_id) }}
        onClick={() => onClick(lead)}
      >
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg truncate">{lead.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {lead.position && `${lead.position}${lead.company ? ' at ' : ''}`}
                {lead.company && <span className="font-medium">{lead.company}</span>}
              </p>
            </div>
            {isExcelLead ? (
              <div className="flex items-center text-xs text-white bg-green-600 rounded-full px-2 py-1">
                <Table size={12} className="mr-1" />
                Excel
              </div>
            ) : (
              <LeadScoreIndicator score={lead.score} size="sm" />
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <LeadStatusBadge status={lead.status} />
          </div>
          
          <div className="space-y-2 text-sm flex-grow">
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-muted-foreground" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Building size={14} className="text-muted-foreground" />
              <span className="truncate text-xs">{lead.project_name}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {isExcelLead ? 
                "Imported from Excel" : 
                (lead.last_contact 
                  ? `Last contact: ${formatDistanceToNow(new Date(lead.last_contact), { addSuffix: true })}` 
                  : 'No contact yet')
              }
            </div>
            <motion.div 
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ExternalLink size={14} className="text-muted-foreground" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Generate a consistent color based on project ID
const getProjectColor = (projectId: string): string => {
  const colors = [
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#06B6D4', // cyan-500
  ];
  
  if (!projectId) return '#94a3b8'; // slate-400 for unassigned
  
  // Simple hash function to get a consistent index
  const hashCode = projectId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hashCode % colors.length];
};

export default LeadCard;
