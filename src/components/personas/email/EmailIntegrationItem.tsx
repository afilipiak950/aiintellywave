
import { Button } from '@/components/ui/button';
import { EmailIntegration } from '@/types/persona';
import { CheckCircle2, Mail, Trash2 } from 'lucide-react';

interface EmailIntegrationItemProps {
  integration: EmailIntegration;
  onImport: (integration: EmailIntegration) => void;
  onDisconnect: (integration: EmailIntegration) => void;
}

export function EmailIntegrationItem({
  integration,
  onImport,
  onDisconnect,
}: EmailIntegrationItemProps) {
  return (
    <div 
      className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <div>
          <p className="font-medium">{integration.email}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {integration.provider}
            <span className="ml-2 text-primary">• Temporary Access</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="hover:bg-background/50"
          onClick={() => onImport(integration)}
        >
          <Mail className="h-4 w-4 mr-1" />
          Import
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          onClick={() => onDisconnect(integration)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
