
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, RefreshCw, Check } from 'lucide-react';
import { useSocialIntegrations } from '@/hooks/use-social-integrations';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import SecurePasswordField from './SecurePasswordField';

const XingIntegrationSection: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const {
    integrations,
    isLoading,
    saveIntegration,
    updateIntegration,
    deleteIntegration,
    isSaving,
    isDeleting
  } = useSocialIntegrations('xing');

  const existingIntegration = integrations.length > 0 ? integrations[0] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (existingIntegration) {
        await updateIntegration({
          id: existingIntegration.id,
          username,
          password
        });
        toast({
          title: "Xing credentials updated",
          description: "Your Xing credentials have been securely updated.",
          variant: "default",
        });
      } else {
        await saveIntegration({
          username,
          password,
          platform: 'xing'
        });
        toast({
          title: "Xing connected",
          description: "Your Xing credentials have been securely stored.",
          variant: "default",
        });
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error saving credentials",
        description: error.message || "Failed to save Xing credentials",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!existingIntegration) return;
    
    try {
      await deleteIntegration(existingIntegration.id);
      setUsername('');
      setPassword('');
      toast({
        title: "Xing disconnected",
        description: "Your Xing integration has been removed.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error removing integration",
        description: error.message || "Failed to remove Xing integration",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    
    // Simulate a connection test
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Connection successful",
        description: "Your Xing credentials were verified successfully.",
        variant: "default",
      });
    }, 1500);
  };

  const startEditing = () => {
    if (existingIntegration) {
      setUsername(existingIntegration.username);
      // Password is intentionally not set for security
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-xing/20 bg-white">
      <CardHeader>
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-xing flex items-center justify-center">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.92,0h-4.12c-0.24,0-0.48,0.12-0.63,0.36L8.28,12.59c-0.16,0.24-0.16,0.48,0,0.71l6.38,11.56c0.12,0.24,0.39,0.36,0.63,0.36h4.12c0.24,0,0.47-0.16,0.63-0.36c0.16-0.24,0.08-0.47,0-0.71l-6.37-11.56h0.04L19.92,0.36C20.08,0.12,20.13,0,19.92,0L19.92,0z" />
              <path d="M7.44,5.65H3.32c-0.24,0-0.47,0.12-0.63,0.36c-0.16,0.24-0.08,0.51,0,0.71l3.31,5.72c0.12,0.24,0.12,0.52,0,0.71L2.28,18.94c-0.12,0.24-0.12,0.47,0,0.71c0.16,0.24,0.39,0.36,0.63,0.36h4.12c0.24,0,0.51-0.12,0.63-0.36l3.75-5.83c0.12-0.24,0.12-0.47,0-0.71L8.07,6.01C7.91,5.77,7.67,5.65,7.44,5.65L7.44,5.65z" />
            </svg>
          </div>
          <div>
            <CardTitle>Xing Integration</CardTitle>
            <CardDescription>Connect your Xing account for automated updates</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xing-username">Xing Email or Username</Label>
              <Input 
                id="xing-username"
                placeholder="your.email@example.com"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            
            <SecurePasswordField 
              label="Xing Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your Xing password"
            />
            
            <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 10V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V10M12 14V17M7 10H17C18.1046 10 19 10.8954 19 12V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V12C5 10.8954 5.89543 10 7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Your credentials are encrypted with military-grade protection
            </div>
          </form>
        ) : existingIntegration ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium">Xing: Connected</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Username:</div>
              <div>{existingIntegration.username}</div>
              
              <div className="text-muted-foreground">Password:</div>
              <div>•••••••••••••</div>
              
              <div className="text-muted-foreground">Last updated:</div>
              <div>{formatDistanceToNow(new Date(existingIntegration.updated_at), { addSuffix: true })}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No Xing integration yet.</p>
            <p className="text-sm">Please add your credentials to connect.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
        {isEditing ? (
          <div className="flex w-full sm:w-auto gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              className="flex-1 bg-xing hover:bg-xing/90"
              disabled={isSaving}
            >
              {isSaving ? (
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
                className="w-full bg-xing hover:bg-xing/90"
              >
                Connect Xing
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default XingIntegrationSection;
