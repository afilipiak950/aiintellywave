
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, RefreshCw, Check, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SecurePasswordField from './SecurePasswordField';
import { useXingIntegration } from '@/hooks/use-xing-integration';

const XingIntegrationSection: React.FC = () => {
  const {
    username,
    password,
    setPassword,
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
  } = useXingIntegration();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-green-500/20 bg-white">
      <CardHeader>
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M18.188 0c.517 0 1.011.206 1.377.571.364.365.57.858.57 1.375v20.108c0 .517-.206 1.01-.57 1.376a1.957 1.957 0 01-1.377.57H5.811a1.957 1.957 0 01-1.376-.57 1.957 1.957 0 01-.57-1.376V1.946c0-.517.205-1.01.57-1.375A1.957 1.957 0 015.811 0h12.377zm-6.763 9.06c.297 0 .568.12.765.315a1.07 1.07 0 01.011 1.519l-2.028 2.025 2.031 2.029a1.074 1.074 0 01-.011 1.516 1.065 1.065 0 01-.765.315 1.07 1.07 0 01-.754-.31l-2.042-2.04-2.039 2.04a1.074 1.074 0 01-1.52-.005 1.077 1.077 0 01-.005-1.516l2.035-2.03-2.035-2.026a1.071 1.071 0 01.005-1.518 1.074 1.074 0 01.755-.316c.295 0 .56.118.757.31l2.037 2.028 2.04-2.027a1.064 1.064 0 01.763-.31zm8.288 1.957a1.07 1.07 0 010 2.142h-5.995a1.07 1.07 0 110-2.142h5.995z" />
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
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">We'll use your email address as the username</p>
            </div>
            
            <SecurePasswordField 
              label="Xing Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your Xing password"
              showEncryptingAnimation={isEncrypting}
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
              onClick={cancelEditing}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
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
                className="w-full bg-green-600 hover:bg-green-700"
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
