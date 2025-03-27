
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { exchangeGmailCode, exchangeOutlookCode } from '@/services/email-integration-provider-service';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function EmailAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        if (!user) {
          setMessage('You must be logged in to connect an email account.');
          setStatus('error');
          return;
        }
        
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        
        if (error) {
          setMessage(`Authentication error: ${error}`);
          setStatus('error');
          return;
        }
        
        if (!code) {
          setMessage('No authorization code received.');
          setStatus('error');
          return;
        }
        
        // Determine which provider to use based on state
        const provider = state || 'gmail'; // Default to Gmail if no state
        
        let result;
        if (provider === 'gmail') {
          result = await exchangeGmailCode(code, user.id);
        } else if (provider === 'outlook') {
          result = await exchangeOutlookCode(code, user.id);
        } else {
          throw new Error(`Unknown provider: ${provider}`);
        }
        
        setMessage(`Successfully connected ${result.integration.email} (${result.integration.provider})`);
        setStatus('success');
        
        // Display success toast
        toast({
          title: 'Account Connected',
          description: `Successfully connected ${result.integration.email}`,
        });
        
        // Redirect back after success
        setTimeout(() => {
          navigate('/customer/ki-personas');
        }, 3000);
      } catch (error: any) {
        console.error('Authentication error:', error);
        setMessage(`Error: ${error.message}`);
        setStatus('error');
        
        toast({
          title: 'Connection Failed',
          description: `Failed to connect account: ${error.message}`,
          variant: 'destructive',
        });
      }
    };
    
    processAuth();
  }, [location, navigate, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-xl shadow-md border">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          )}
          
          {status === 'success' && (
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <h2 className="text-2xl font-bold">
            {status === 'loading' && 'Connecting Account'}
            {status === 'success' && 'Account Connected'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">Redirecting you back in a moment...</p>
          )}
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/customer/ki-personas')}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to KI Personas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
