
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, RefreshCw, Check, Mail, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SecurePasswordField from './SecurePasswordField';
import { useEmailSMTPIntegration } from '@/hooks/use-email-smtp-integration';

const EmailSMTPIntegrationSection: React.FC = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    imapHost,
    setImapHost,
    imapPort,
    setImapPort,
    isEditing,
    isTesting,
    isEncrypting,
    isLoading,
    isSaving,
    isDeleting,
    existingIntegration,
    handleSubmit,
    handleDelete,
    handleTestConnection,
    startEditing,
    cancelEditing
  } = useEmailSMTPIntegration();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-blue-500/20 bg-white">
      <CardHeader>
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Email Integration (SMTP/IMAP)</CardTitle>
            <CardDescription>Connect your email account for automated communications</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-username">Email Username</Label>
                <Input 
                  id="email-username"
                  placeholder="your.email@example.com"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <SecurePasswordField 
                  label="Email Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your email password"
                  showEncryptingAnimation={isEncrypting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Server Host</Label>
                <Input 
                  id="smtp-host"
                  placeholder="smtp.example.com"
                  value={smtpHost}
                  onChange={e => setSmtpHost(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input 
                  id="smtp-port"
                  placeholder="587"
                  value={smtpPort}
                  onChange={e => setSmtpPort(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imap-host">IMAP Server Host</Label>
                <Input 
                  id="imap-host"
                  placeholder="imap.example.com"
                  value={imapHost}
                  onChange={e => setImapHost(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imap-port">IMAP Port</Label>
                <Input 
                  id="imap-port"
                  placeholder="993"
                  value={imapPort}
                  onChange={e => setImapPort(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2">
              <Lock className="h-3 w-3" />
              Your credentials are encrypted with military-grade protection
            </div>
          </form>
        ) : existingIntegration ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium">Email: Connected</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Username:</div>
              <div>{existingIntegration.username}</div>
              
              <div className="text-muted-foreground">Password:</div>
              <div>•••••••••••••</div>

              <div className="text-muted-foreground">SMTP Host:</div>
              <div>{existingIntegration.smtp_host}</div>
              
              <div className="text-muted-foreground">SMTP Port:</div>
              <div>{existingIntegration.smtp_port}</div>
              
              <div className="text-muted-foreground">IMAP Host:</div>
              <div>{existingIntegration.imap_host}</div>
              
              <div className="text-muted-foreground">IMAP Port:</div>
              <div>{existingIntegration.imap_port}</div>
              
              <div className="text-muted-foreground">Last updated:</div>
              <div>{formatDistanceToNow(new Date(existingIntegration.updated_at), { addSuffix: true })}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No Email integration yet.</p>
            <p className="text-sm">Please add your credentials to connect.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
        {isEditing ? (
          <div className="flex w-full sm:w-auto gap-2">
            <Button 
              variant="outline" 
              onClick={cancelEditing}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving || isEncrypting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Credentials'
              )}
            </Button>
          </div>
        ) : (
          <div className="flex w-full sm:w-auto gap-2">
            {existingIntegration ? (
              <>
                <Button
                  variant="outline"
                  onClick={startEditing}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Edit
                </Button>
                <Button
                  variant="outline" 
                  onClick={handleTestConnection}
                  className="flex-1"
                  disabled={isTesting || isDeleting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={startEditing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Add Integration
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmailSMTPIntegrationSection;
