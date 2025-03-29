
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadProfileCardProps {
  lead: Lead | null;
  getInitials: () => string;
}

const LeadProfileCard = ({ lead, getInitials }: LeadProfileCardProps) => {
  if (!lead) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="p-6 border-b"
    >
      <div className="flex gap-4 items-start">
        <Avatar className="h-20 w-20 rounded-xl border-4 border-white shadow-xl bg-gradient-to-br from-indigo-100 to-purple-100">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-2xl font-bold">{lead.name}</h2>
              {lead.position && (
                <p className="text-muted-foreground">{lead.position}</p>
              )}
            </div>
              
            <Badge 
              variant={lead.status === 'new' ? 'default' : 'outline'} 
              className={cn(
                "text-xs px-2 py-0.5 capitalize",
                lead.status === 'qualified' && "bg-green-100 text-green-800 border-green-300",
                lead.status === 'contacted' && "bg-blue-100 text-blue-800 border-blue-300",
                lead.status === 'negotiation' && "bg-amber-100 text-amber-800 border-amber-300",
                lead.status === 'won' && "bg-emerald-100 text-emerald-800 border-emerald-300",
                lead.status === 'lost' && "bg-red-100 text-red-800 border-red-300",
              )}
            >
              {lead.status}
            </Badge>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            {lead.company && (
              <div className="flex items-center text-sm">
                <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>{lead.company}</span>
              </div>
            )}
            
            {lead.score > 0 && (
              <Badge variant="outline" className="bg-amber-50 border-amber-200">
                Score: {lead.score}
              </Badge>
            )}
            
            {lead.last_contact && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>Last contact: {lead.last_contact}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeadProfileCard;
