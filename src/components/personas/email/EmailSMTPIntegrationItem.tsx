
import { Button } from '@/components/ui/button';
import { SocialIntegration } from '@/types/persona';
import { Mail } from 'lucide-react';

interface EmailSMTPIntegrationItemProps {
  integration: SocialIntegration;
  onDisconnect: () => void;
}

export function EmailSMTPIntegrationItem({ 
  integration, 
  onDisconnect 
}: EmailSMTPIntegrationItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <div>
          <p className="font-medium text-sm">{integration.username}</p>
          <p className="text-xs text-muted-foreground">SMTP: {integration.smtp_host}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onDisconnect}>
        Disconnect
      </Button>
    </div>
  );
}
