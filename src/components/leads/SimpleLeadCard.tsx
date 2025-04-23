
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface SimpleLeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

const SimpleLeadCard: React.FC<SimpleLeadCardProps> = ({ lead, onClick }) => {
  // Helper function to get the proper display name
  const getLeadDisplayName = (): string => {
    if (lead.first_name && lead.last_name) {
      return `${lead.first_name} ${lead.last_name}`;
    } else if (lead.extra_data?.["First Name"] && lead.extra_data?.["Last Name"]) {
      return `${lead.extra_data["First Name"]} ${lead.extra_data["Last Name"]}`;
    } else if (lead.extra_data?.["first_name"] && lead.extra_data?.["last_name"]) {
      return `${lead.extra_data["first_name"]} ${lead.extra_data["last_name"]}`;
    } else {
      return lead.name || 'Unbekannt';
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'qualified': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'proposal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'negotiation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'won': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg truncate" title={getLeadDisplayName()}>
              {getLeadDisplayName()}
            </h3>
            {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
          </div>
          <Badge className={`${getStatusColor(lead.status)}`}>
            {lead.status}
          </Badge>
        </div>
        
        {lead.email && (
          <p className="text-sm mt-2 truncate">{lead.email}</p>
        )}
        
        {lead.phone && (
          <p className="text-sm text-muted-foreground mt-1">{lead.phone}</p>
        )}
        
        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
          <span>{lead.project_name}</span>
          <span>{formatDate(lead.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleLeadCard;
