import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmailIntegrationItem } from './email/EmailIntegrationItem';
import { EmailProviderDialog } from './email/EmailProviderDialog';
import { ConfigErrorDialog } from './email/ConfigErrorDialog';
import { VerificationErrorDialog } from './email/VerificationErrorDialog';
import { useEmailAccounts } from '@/hooks/use-email-accounts';
import { Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmailIntegration } from '@/types/persona';

export function EmailAccountsCard() {
  const {
    emailIntegrations,
    isLoadingIntegrations,
    isErrorIntegrations,
    isProviderDialogOpen,
    setIsProviderDialogOpen,
    configErrorDialogOpen,
    setConfigErrorDialogOpen,
    verificationErrorDialogOpen,
    setVerificationErrorDialogOpen,
    configError,
    configErrorProvider,
    isLoading,
    loadingProvider,
    onProviderSubmit,
    handleOAuthConnect,
    handleImportEmails,
    handleDisconnect,
  } = useEmailAccounts();

  // Create wrapper functions to match the expected types in EmailIntegrationItem
  const onImport = (integration: EmailIntegration) => {
    handleImportEmails(integration.id, integration.provider);
  };

  const onDisconnect = (integration: EmailIntegration) => {
    handleDisconnect(integration.id);
  };

  return (
    <Card className="h-full border-t-4 border-t-primary/70 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-background to-muted/30 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Temporary Email Connections
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-xs">Privacy Protected</span>
          </Badge>
        </div>
        <CardDescription>
          Connect your email temporarily to analyze writing style for AI personas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingIntegrations ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 text-muted-foreground">◌</div>
          </div>
        ) : emailIntegrations.length > 0 ? (
          <div className="space-y-3">
            {emailIntegrations.map((integration) => (
              <EmailIntegrationItem 
                key={integration.id}
                integration={integration}
                onImport={onImport}
                onDisconnect={onDisconnect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md bg-muted/20 animate-pulse">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No temporary email connections</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10">
        <Button className="w-full bg-primary/90 hover:bg-primary" onClick={() => setIsProviderDialogOpen(true)}>
          Connect Email Temporarily
        </Button>
      </CardFooter>

      {/* OAuth Provider Dialog */}
      <EmailProviderDialog
        open={isProviderDialogOpen}
        onOpenChange={setIsProviderDialogOpen}
        onManualSubmit={onProviderSubmit}
        onOAuthConnect={handleOAuthConnect}
        isLoading={isLoading}
        loadingProvider={loadingProvider}
      />

      {/* Configuration Error Dialog */}
      <ConfigErrorDialog
        open={configErrorDialogOpen}
        onOpenChange={setConfigErrorDialogOpen}
        configError={configError}
        configErrorProvider={configErrorProvider}
      />

      {/* Verification Error Dialog */}
      <VerificationErrorDialog
        open={verificationErrorDialogOpen}
        onOpenChange={setVerificationErrorDialogOpen}
      />
    </Card>
  );
}
