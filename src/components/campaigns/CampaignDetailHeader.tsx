
import { Campaign } from '@/types/campaign';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail } from 'lucide-react';

interface CampaignDetailHeaderProps {
  campaign: Campaign | null;
}

const CampaignDetailHeader = ({ campaign }: CampaignDetailHeaderProps) => {
  if (!campaign) {
    return null;
  }

  const formatStatus = (status: any): string => {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Draft';
        case 1: return 'Active';
        case 2: return 'Paused';
        case 3: return 'Paused';
        case 4: return 'Completed';
        case 5: return 'Stopped';
        default: return 'Unknown';
      }
    }
    return typeof status === 'string'
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : 'Unknown';
  };

  const getStatusColor = (status: any): string => {
    if (status === 'active' || status === 1) {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'paused' || status === 2 || status === 3) {
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    }
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Campaign ID: {campaign.id}
          </p>
        </div>
        <Badge className={getStatusColor(campaign.status)}>
          {formatStatus(campaign.status)}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="mr-1 h-4 w-4" />
          <span>Created: {new Date(campaign.created_at || campaign.date || '').toLocaleDateString()}</span>
        </div>
        
        {campaign.updated_at && (
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>Updated: {new Date(campaign.updated_at).toLocaleDateString()}</span>
          </div>
        )}
        
        {campaign.statistics?.emailsSent !== undefined && (
          <div className="flex items-center">
            <Mail className="mr-1 h-4 w-4" />
            <span>Emails sent: {campaign.statistics.emailsSent}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetailHeader;
