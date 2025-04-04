import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormField } from '@/components/ui/form';
import { Linkedin, Lock, RefreshCw, Check } from 'lucide-react';
import { useLinkedInIntegration } from '@/hooks/use-linkedin-integration';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface LinkedInFormValues {
  username: string;
  password: string;
}

const LinkedInIntegrationTab = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { toast } = useToast();
  
  const {
    username,
    setUsername,
    password,
    setPassword,
    isEditing,
    isTesting,
    isLoading,
    isSaving,
    existingIntegration,
    handleSubmit,
    handleDelete,
    handleTestConnection,
    startEditing,
    cancelEditing
  } = useLinkedInIntegration();
  
  const form = useForm<LinkedInFormValues>({
    defaultValues: {
      username: username,
      password: ''
    }
  });

  const onFormSubmit = async () => {
    setIsEncrypting(true);
    
    try {
      // Submit using the hook's handler
      await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      
      toast({
        title: existingIntegration ? "LinkedIn credentials updated" : "LinkedIn connected",
        description: "Your LinkedIn credentials have been securely stored.",
      });
    } catch (error: any) {
      console.error('Error saving LinkedIn credentials:', error);
      toast({
        title: "Error saving credentials",
        description: error.message || "Failed to save LinkedIn credentials",
        variant: "destructive",
      });
    } finally {
      setIsEncrypting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-700" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-full">
          <Linkedin className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h2 className="text-xl font-medium">LinkedIn Integration</h2>
          <p className="text-sm text-gray-500">Connect your LinkedIn account to import contacts and share updates</p>
        </div>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="your.email@example.com"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the email address used for your LinkedIn account
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {isEncrypting && (
                        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center rounded-md">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-3 w-3 text-primary animate-spin" />
                            <span className="text-xs text-muted-foreground">Encrypting...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    <span>Your password is encrypted with military-grade protection</span>
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                type="button" 
                onClick={cancelEditing}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || isEncrypting}
                className="bg-[#0077B5] hover:bg-[#00669c]"
              >
                {isSaving || isEncrypting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  existingIntegration ? 'Update Credentials' : 'Save Credentials'
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : existingIntegration ? (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center mb-2">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">LinkedIn: Connected</span>
                </div>
                <p className="text-sm text-gray-500">Username: {username}</p>
                <p className="text-sm text-gray-500">Connected on {formatDistanceToNow(new Date(existingIntegration.created_at), { addSuffix: true })}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={startEditing}
            >
              Edit Credentials
            </Button>
            <Button
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm">
              Connecting your LinkedIn account allows you to import contacts, share updates, and track engagement directly from the platform.
            </p>
          </div>

          <Button 
            className="bg-[#0077B5] hover:bg-[#00669c]" 
            onClick={startEditing}
          >
            <Linkedin className="w-5 h-5 mr-2" />
            Connect with LinkedIn
          </Button>
        </>
      )}
    </Card>
  );
};

export default LinkedInIntegrationTab;
