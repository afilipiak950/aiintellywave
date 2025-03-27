
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { exchangeGmailCode, exchangeOutlookCode } from '@/services/email-integration-provider-service';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EmailAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'access_denied' | 'verification' | 'configuration' | 'other' | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthRedirect = async () => {
      try {
        console.log('Processing OAuth redirect...');
        
        // Get the URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state'); // 'gmail' or 'outlook'
        const errorParam = params.get('error');
        
        if (errorParam) {
          // Handle specific OAuth error cases
          if (errorParam === 'access_denied') {
            setErrorType('access_denied');
            throw new Error('Connection rejected: You denied the authorization request');
          } else if (errorParam.includes('verification') || errorParam === 'verification_required') {
            setErrorType('verification');
            throw new Error('Google verification required: This preview domain hasn\'t completed Google\'s verification process');
          } else {
            const errorDescription = params.get('error_description') || 'Unknown error';
            throw new Error(`Authorization error: ${errorParam} - ${errorDescription}`);
          }
        }
        
        if (!code) {
          throw new Error('No authorization code found in the URL');
        }
        
        if (!state) {
          throw new Error('No provider state found in the URL');
        }
        
        if (!user) {
          throw new Error('User is not authenticated');
        }
        
        console.log(`Exchanging code for ${state} tokens...`);
        
        // Exchange code for tokens based on provider
        if (state === 'gmail') {
          await exchangeGmailCode(code, user.id);
          toast({
            title: 'Gmail Connected',
            description: 'Your Gmail account has been successfully connected.',
          });
        } else if (state === 'outlook') {
          const result = await exchangeOutlookCode(code, user.id);
          console.log('Outlook token exchange result:', result);
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
        
        // Extract detailed error if available
        let errorMessage = err.message || 'Failed to connect your email account';
        let detailedErrorInfo = null;
        
        // Check if error message contains verification issues
        if (errorMessage.includes('verification process') || errorMessage.includes('verification required')) {
          setErrorType('verification');
        }
        
        if (err.response) {
          try {
            // Try to extract error details from response
            const responseData = err.response.data;
            if (responseData && responseData.error) {
              detailedErrorInfo = JSON.stringify(responseData, null, 2);
              
              // Check if this is a configuration error
              if (responseData.error.includes('configuration') || 
                  responseData.error.includes('credentials') || 
                  responseData.error.includes('invalid_client')) {
                setErrorType('configuration');
              }
            }
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
        }
        
        setError(errorMessage);
        if (detailedErrorInfo) {
          setDetailedError(detailedErrorInfo);
        }
        
        // Set appropriate toast variant based on error type
        const variant = errorType === 'access_denied' ? 'default' : 'destructive';
        
        toast({
          title: errorType === 'access_denied' ? 'Connection Cancelled' : 'Connection Error',
          description: errorMessage,
          variant: variant,
        });
        
        // Still redirect back after a delay
        setTimeout(() => {
          navigate('/customer/ki-personas');
        }, 5000);
      } finally {
        setIsProcessing(false);
      }
    };
    
    processOAuthRedirect();
  }, [user, navigate, errorType]);

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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive h-6 w-6"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h1 className="text-2xl font-bold">
            {errorType === 'access_denied' ? 'Connection Cancelled' : 
             errorType === 'verification' ? 'Google Verification Required' : 
             'Connection Error'}
          </h1>
          <Alert variant={errorType === 'access_denied' ? 'default' : 'destructive'} className="mb-4">
            <AlertTitle>
              {errorType === 'access_denied' ? 'Authorization Declined' : 
               errorType === 'verification' ? 'Verification Issue' : 
               'Authentication Failed'}
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          {errorType === 'verification' && (
            <div className="w-full">
              <div className="bg-muted p-3 rounded-md text-sm">
                <h3 className="font-semibold mb-1">Why This Happens:</h3>
                <p className="mb-2">
                  This issue occurs because Google requires domains that access sensitive data (like email) to go through 
                  their verification process. Preview domains used during development typically aren't verified.
                </p>
                <h3 className="font-semibold mb-1">Solutions:</h3>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Deploy the app to a verified domain</li>
                  <li>Add test users to your Google Cloud project (recommended for development)</li>
                  <li>Use a different authentication method for testing purposes</li>
                </ul>
              </div>
            </div>
          )}
          
          {detailedError && errorType !== 'access_denied' && errorType !== 'verification' && (
            <div className="w-full">
              <h3 className="text-sm font-medium text-destructive mb-2">Detailed Error Information:</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40 text-left">
                {detailedError}
              </pre>
            </div>
          )}
          
          <p className="text-sm">Redirecting back to KI Personas in 5 seconds...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <div className="rounded-full bg-primary/20 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-6 w-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h1 className="text-2xl font-bold">Connected Successfully</h1>
          <p className="text-muted-foreground">Your email account has been connected!</p>
          <p className="text-sm">Redirecting back to KI Personas...</p>
        </div>
      )}
    </div>
  );
}
