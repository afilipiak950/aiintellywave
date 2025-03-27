
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Info, ExternalLink } from 'lucide-react';

interface VerificationErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerificationErrorDialog({
  open,
  onOpenChange,
}: VerificationErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" /> Google Verification Required
          </DialogTitle>
          <DialogDescription>
            The preview app domain hasn't completed Google's verification process
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="mt-2">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Google Verification Error</AlertTitle>
          <AlertDescription>
            This preview domain is not verified by Google, which is preventing the OAuth login process.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 mt-4">
          <div className="bg-muted p-3 rounded-md text-sm">
            <h3 className="font-semibold mb-1">Why This Happens:</h3>
            <p className="mb-2">
              This issue occurs because Google requires domains that access sensitive data (like email) to go through 
              their verification process. Preview domains used during development typically aren't verified.
            </p>
            <h3 className="font-semibold mb-1">Solutions:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Deploy the app to a verified domain</li>
              <li>Add test users to your Google Cloud project (recommended for development)</li>
              <li>Whitelist your email in the Google Cloud OAuth settings</li>
              <li>Use a different authentication method for testing purposes</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
            >
              <ExternalLink className="h-4 w-4" /> Open Google Cloud Console
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open('https://support.google.com/cloud/answer/10311615', '_blank')}
            >
              <Info className="h-4 w-4" /> Google Verification Guide
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
