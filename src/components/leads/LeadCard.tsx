
import React from 'react';
import { Lead } from '@/types/lead';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LeadStatusBadge from './LeadStatusBadge';
import LeadScoreIndicator from './LeadScoreIndicator';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone, Building, User, Tag } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  index?: number;
  onClick?: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, index, onClick }) => {
  // Show when the lead was created or last contacted
  const timeAgo = lead.last_contact 
    ? formatDistanceToNow(new Date(lead.last_contact), { addSuffix: true })
    : formatDistanceToNow(new Date(lead.created_at), { addSuffix: true });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200" 
          onClick={onClick} 
          role="button" 
          tabIndex={0}
          data-testid={`lead-card-${index}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg truncate" title={lead.name}>{lead.name}</h3>
          {lead.company && (
            <div className="flex items-center text-gray-500 text-sm">
              <Building size={14} className="mr-1" />
              <span className="truncate" title={lead.company}>{lead.company}</span>
            </div>
          )}
        </div>
        <LeadScoreIndicator score={lead.score} />
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid gap-1 text-sm">
          {lead.position && (
            <div className="flex items-center text-gray-600" title={lead.position}>
              <User size={14} className="mr-2 flex-shrink-0" />
              <span className="truncate">{lead.position}</span>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center text-gray-600" title={lead.email}>
              <Mail size={14} className="mr-2 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center text-gray-600" title={lead.phone}>
              <Phone size={14} className="mr-2 flex-shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
        </div>
        
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {lead.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag size={10} className="mr-1" />
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">+{lead.tags.length - 3} more</Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2 pb-3 border-t">
        <div className="flex items-center">
          <LeadStatusBadge status={lead.status} />
        </div>
        <div className="text-xs text-gray-500">{timeAgo}</div>
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
