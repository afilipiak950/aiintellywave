
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { exchangeGmailCode, exchangeOutlookCode } from '@/services/email-integration-provider-service';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function EmailAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthRedirect = async () => {
      try {
        // Get the URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state'); // 'gmail' or 'outlook'
        
        if (!code) {
          throw new Error('No authorization code found in the URL');
        }
        
        if (!state) {
          throw new Error('No provider state found in the URL');
        }
        
        if (!user) {
          throw new Error('User is not authenticated');
        }
        
        // Exchange code for tokens based on provider
        if (state === 'gmail') {
          await exchangeGmailCode(code, user.id);
          toast({
            title: 'Gmail Connected',
            description: 'Your Gmail account has been successfully connected.',
          });
        } else if (state === 'outlook') {
          await exchangeOutlookCode(code, user.id);
          toast({
            title: 'Outlook Connected',
            description: 'Your Outlook account has been successfully connected.',
          });
        } else {
          throw new Error(`Unsupported provider: ${state}`);
        }
        
        // Redirect back to KI Personas page
        navigate('/customer/ki-personas');
      } catch (err: any) {
        console.error('Error processing OAuth redirect:', err);
        setError(err.message || 'Failed to connect your email account');
        toast({
          title: 'Connection Error',
          description: err.message || 'Failed to connect your email account',
          variant: 'destructive',
        });
        
        // Still redirect back after a delay
        setTimeout(() => {
          navigate('/customer/ki-personas');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };
    
    processOAuthRedirect();
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {isProcessing ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Processing Email Authorization</h1>
          <p className="text-muted-foreground text-center">
            Please wait while we connect your email account...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <div className="rounded-full bg-destructive/20 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-destructive h-6 w-6"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h1 className="text-2xl font-bold">Connection Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm">Redirecting back to KI Personas...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <div className="rounded-full bg-primary/20 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary h-6 w-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h1 className="text-2xl font-bold">Connected Successfully</h1>
          <p className="text-muted-foreground">Your email account has been connected!</p>
          <p className="text-sm">Redirecting back to KI Personas...</p>
        </div>
      )}
    </div>
  );
}
