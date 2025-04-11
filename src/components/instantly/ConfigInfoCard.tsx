
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface ConfigInfoCardProps {
  configData: {
    last_updated: string | null;
  } | null;
  formatDate: (dateString: string | null) => string;
}

const ConfigInfoCard: React.FC<ConfigInfoCardProps> = ({ configData, formatDate }) => {
  if (!configData) return null;
  
  return (
    <Card className="bg-muted/40">
      <CardContent className="pt-4">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Last synced: {formatDate(configData?.last_updated || '')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigInfoCard;
