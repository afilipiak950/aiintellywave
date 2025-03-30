
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SecurePasswordField from './SecurePasswordField';
import { useSocialIntegrations } from '@/hooks/use-social-integrations';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LinkedInIntegrationSection: React.FC = () => {
  const { integrations, isLoading, isSaving, saveIntegration } = useSocialIntegrations('linkedin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  const integration = integrations && integrations.length > 0 ? integrations[0] : null;
  
  const handleSave = async () => {
    try {
      // Show encryption animation
      setIsEncrypting(true);
      
      // Wait for animation to be visible before saving
      setTimeout(async () => {
        await saveIntegration({
          username,
          password,
          platform: 'linkedin'
        });
        
        toast({
          title: "Success",
          description: "LinkedIn credentials saved successfully",
        });
        
        // Remove animation
        setIsEncrypting(false);
      }, 800); // Show animation for 800ms before saving
    } catch (error) {
      console.error('Error saving LinkedIn credentials:', error);
      setIsEncrypting(false);
      toast({
        title: "Error",
        description: "Failed to save LinkedIn credentials",
        variant: "destructive"
      });
    }
  };
  
  React.useEffect(() => {
    if (integration) {
      setUsername(integration.username || '');
      setPassword(integration.password || '');
    }
  }, [integration]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="ml-2">Loading integration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">LinkedIn Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin-username">LinkedIn Email/Username</Label>
            <Input 
              id="linkedin-username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your.email@example.com"
              disabled={isSaving || isEncrypting}
            />
          </div>
          
          <SecurePasswordField
            value={password}
            onChange={setPassword}
            label="LinkedIn Password"
            placeholder="Enter your LinkedIn password"
            disabled={isSaving}
            showEncryption={isEncrypting}
          />
          
          <div className="text-xs text-muted-foreground mt-2">
            Your credentials are securely encrypted and only used for authorized actions.
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isEncrypting || !username || !password}
          className="w-full md:w-auto"
        >
          {isSaving || isEncrypting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEncrypting ? 'Encrypting...' : 'Saving...'}
            </>
          ) : (
            <>Save Credentials</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LinkedInIntegrationSection;
