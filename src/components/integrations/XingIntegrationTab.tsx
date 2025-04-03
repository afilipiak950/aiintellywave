
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormField } from '@/components/ui/form';
import { MessageSquare, Lock, RefreshCw, Check } from 'lucide-react';
import { useXingIntegration } from '@/hooks/use-xing-integration';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface XingFormValues {
  username: string;
  password: string;
}

const XingIntegrationTab = () => {
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
  } = useXingIntegration();
  
  const form = useForm<XingFormValues>({
    defaultValues: {
      username: username || '',
      password: ''
    }
  });

  const onFormSubmit = async (data: XingFormValues) => {
    setIsEncrypting(true);
    
    try {
      // Update state values from form
      setUsername(data.username);
      setPassword(data.password);
      
      // Wait for encryption animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Submit using the hook's handler
      await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      
      toast({
        title: existingIntegration ? "Xing credentials updated" : "Xing connected",
        description: "Your Xing credentials have been securely stored.",
      });
    } catch (error: any) {
      console.error('Error saving Xing credentials:', error);
      toast({
        title: "Error saving credentials",
        description: error.message || "Failed to save Xing credentials",
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
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded-full">
          <MessageSquare className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-medium">Xing Integration</h2>
          <p className="text-sm text-gray-500">Connect your Xing account to import contacts and messages</p>
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
                  <FormLabel>Xing Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
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
                      <Input type="password" placeholder="••••••••" {...field} />
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
                className="bg-green-600 hover:bg-green-700"
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
                  <span className="font-medium">Xing: Connected</span>
                </div>
                <p className="text-sm text-gray-500">Username: {existingIntegration.username}</p>
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
              Connecting your Xing account allows you to import contacts and messages directly from Xing to the platform.
            </p>
          </div>

          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={startEditing}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Connect with Xing
          </Button>
        </>
      )}
    </Card>
  );
};

export default XingIntegrationTab;
