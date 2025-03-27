
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

interface ConfigErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configError: string | null;
  configErrorProvider: string | null;
}

export function ConfigErrorDialog({
  open,
  onOpenChange,
  configError,
  configErrorProvider,
}: ConfigErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Configuration Error
          </DialogTitle>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing API Configuration</AlertTitle>
          <AlertDescription>
            {configError}
          </AlertDescription>
        </Alert>
        
        <div className="bg-muted p-4 rounded-md text-sm mt-2">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">For System Administrators</p>
              <p>Please ensure the following environment variables are configured in the Supabase Edge Functions:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {configErrorProvider === 'gmail' ? (
                  <>
                    <li>GMAIL_CLIENT_ID</li>
                    <li>GMAIL_CLIENT_SECRET</li>
                    <li>REDIRECT_URI</li>
                  </>
                ) : (
                  <>
                    <li>OUTLOOK_CLIENT_ID</li>
                    <li>OUTLOOK_CLIENT_SECRET</li>
                    <li>REDIRECT_URI</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
