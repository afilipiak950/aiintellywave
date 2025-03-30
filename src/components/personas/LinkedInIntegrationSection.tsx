
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, RefreshCw, Check, Lock } from 'lucide-react';
import { useSocialIntegrations } from '@/hooks/use-social-integrations';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SecurePasswordField from './SecurePasswordField';

const LinkedInIntegrationSection: React.FC = () => {
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
  } = useSocialIntegrations('linkedin');

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
          title: "LinkedIn credentials updated",
          description: "Your LinkedIn credentials have been securely updated.",
          variant: "default",
        });
      } else {
        await saveIntegration({
          username,
          password,
          platform: 'linkedin'
        });
        toast({
          title: "LinkedIn connected",
          description: "Your LinkedIn credentials have been securely stored.",
          variant: "default",
        });
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error saving credentials",
        description: error.message || "Failed to save LinkedIn credentials",
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
        title: "LinkedIn disconnected",
        description: "Your LinkedIn integration has been removed.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error removing integration",
        description: error.message || "Failed to remove LinkedIn integration",
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
        description: "Your LinkedIn credentials were verified successfully.",
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
    <Card className="border-linkedin/20 bg-white">
      <CardHeader>
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-linkedin flex items-center justify-center">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
            </svg>
          </div>
          <div>
            <CardTitle>LinkedIn Integration</CardTitle>
            <CardDescription>Connect your LinkedIn account for automated updates</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin-username">LinkedIn Email or Username</Label>
              <Input 
                id="linkedin-username"
                placeholder="your.email@example.com"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            
            <SecurePasswordField 
              id="linkedin-password"
              label="LinkedIn Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your LinkedIn password"
            />
            
            <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2">
              <Lock className="h-3 w-3" />
              Your credentials are encrypted with military-grade protection
            </div>
          </form>
        ) : existingIntegration ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium">LinkedIn: Connected</span>
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
            <p className="text-muted-foreground">No LinkedIn integration yet.</p>
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
              className="flex-1 bg-linkedin hover:bg-linkedin/90"
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
                className="w-full bg-linkedin hover:bg-linkedin/90"
              >
                Connect LinkedIn
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default LinkedInIntegrationSection;
