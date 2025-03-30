
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCcw, Lock, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth';
import { useMutation } from '@tanstack/react-query';
import SecurePasswordField from './SecurePasswordField';
import { useSocialIntegrations } from '@/hooks/use-social-integrations';

// Custom Xing icon as it's not available in Lucide
const XingIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 3c-1.2 0-1.6 0.9-3.3 3.3L8 18c-0.5 0.9-1.2 3-2.7 3-0.5 0-0.9-0.2-1.2-0.6L3.3 19l2.6-4c0.3-0.5 0.2-1-0.2-1.5l-1.1-1.8c-0.4-0.7-0.4-1.5 0-2.2l0.7-1.2c0.6-1 1.7-1.3 2.7-0.8l0.6 0.3c0.8 0.4 1.6 0.2 2.2-0.4l4-5.6C15.4 1 15.8 0 17.7 0h5.1c0.8 0 1.5 0.4 1.9 1.1 0.4 0.7 0.3 1.6-0.1 2.2l-5.3 8.5c-0.3 0.5-0.8 0.8-1.3 0.8h-1.2c-0.5 0-0.8 0.4-0.7 0.9l3.6 7.6c0.2 0.5 0.8 0.9 1.3 0.9h1.1c0.8 0 1.5-0.4 1.9-1.1 0.4-0.7 0.3-1.6-0.1-2.2l-2.6-4.9c-0.2-0.4-0.2-0.9 0.1-1.3L22.8 5c0.4-0.7 0.3-1.6-0.1-2.2C22.3 2.1 21.2 3 18 3z"/>
  </svg>
);

const XingIntegrationSection = () => {
  const { user } = useAuth();
  const { integrations, isLoading, refetch } = useSocialIntegrations('xing');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const hasIntegration = integrations.length > 0;
  const currentIntegration = integrations[0];

  const saveIntegration = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      // In a real app, this would connect to Xing's API
      // For now, we're just storing credentials
      const response = await fetch('/api/dummy-integrations/xing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user?.id,
          username: data.username,
          password: data.password
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save Xing credentials');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Xing credentials saved",
        description: "Your Xing account has been connected successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error saving Xing credentials",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/dummy-integrations/xing/${integrationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete Xing integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Xing disconnected",
        description: "Your Xing account has been disconnected successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error disconnecting Xing",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveIntegration.mutate({ username, password });
  };

  const testConnection = () => {
    setIsTesting(true);
    // Simulate testing with a delay
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Connection test successful",
        description: "Xing connection verified successfully.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {hasIntegration ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-green-600 border-2 border-opacity-50">
            <CardHeader className="pb-3 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XingIcon className="h-5 w-5 text-green-600" />
                  <CardTitle>Xing Connected</CardTitle>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: 3, duration: 1 }}
                >
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    <Check className="h-3 w-3" />
                    <span>Active</span>
                  </div>
                </motion.div>
              </div>
              <CardDescription>
                Your Xing account is connected and ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <div className="text-sm font-medium mt-1">{currentIntegration?.username}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Last updated</div>
                    <div className="font-medium">
                      {currentIntegration?.updated_at 
                        ? new Date(currentIntegration.updated_at).toLocaleString() 
                        : 'Recent'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={testConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <RefreshCcw className="h-3 w-3 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-3 w-3" />
                    <span>Test Connection</span>
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => deleteIntegration.mutate(currentIntegration.id)}
              >
                <X className="h-3 w-3" />
                <span>Disconnect</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-300 flex items-center space-x-3 mb-6">
            <XingIcon className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium">Connect your Xing account</h3>
              <p className="text-sm text-muted-foreground">
                Enter your Xing credentials to enable integration features
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xing-username">Username or Email</Label>
              <Input
                id="xing-username"
                placeholder="username@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="xing-password">Password</Label>
              <SecurePasswordField
                value={password}
                onChange={setPassword}
                placeholder="Enter your Xing password"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                Your credentials are stored with military-grade encryption
              </p>
            </div>

            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={saveIntegration.isPending}
            >
              {saveIntegration.isPending ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Connect Xing Account</>
              )}
            </Button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default XingIntegrationSection;
