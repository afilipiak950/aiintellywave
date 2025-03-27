
import { supabase } from '@/integrations/supabase/client';
import { EmailMessage } from '@/types/persona';

interface AuthorizeOptions {
  useLocalWindow?: boolean;
}

export const authorizeGmail = async (options?: AuthorizeOptions): Promise<string> => {
  try {
    console.log('Requesting Gmail authorization URL from edge function', options);
    const { data, error } = await supabase.functions.invoke('gmail-auth', {
      body: { 
        action: 'authorize',
        options: {
          useLocalWindow: options?.useLocalWindow || false,
          display: options?.useLocalWindow ? 'popup' : 'page'
        }
      },
    });

    console.log('Gmail auth response:', data);

    if (error) {
      console.error('Gmail authorization error from edge function:', error);
      throw new Error(`Gmail authorization error: ${error.message}`);
    }
    
    if (!data || !data.url) {
      console.error('Invalid response from Gmail OAuth service:', data);
      throw new Error('Invalid response from Gmail OAuth service. Please ensure all required environment variables are set.');
    }
    
    // If using local window, append display=popup parameter
    let url = data.url;
    if (options?.useLocalWindow && !url.includes('display=')) {
      url += (url.includes('?') ? '&' : '?') + 'display=popup';
    }
    
    return url;
  } catch (error: any) {
    console.error('Gmail authorization error:', error);
    throw error;
  }
};

export const runGmailDiagnostic = async (): Promise<any> => {
  try {
    console.log('Running Gmail diagnostic checks');
    const { data, error } = await supabase.functions.invoke('gmail-auth', {
      body: { action: 'diagnostic' },
    });

    console.log('Gmail diagnostic response:', data);

    if (error) {
      console.error('Gmail diagnostic error from edge function:', error);
      throw new Error(`Gmail diagnostic error: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Gmail diagnostic error:', error);
    throw error;
  }
};

export const authorizeOutlook = async (): Promise<string> => {
  try {
    console.log('Requesting Outlook authorization URL from edge function');
    const { data, error } = await supabase.functions.invoke('outlook-auth', {
      body: { action: 'authorize' },
    });

    console.log('Outlook auth response:', data);
    
    if (error) {
      console.error('Outlook authorization error from edge function:', error);
      throw new Error(`Outlook authorization error: ${error.message}`);
    }
    
    if (!data || !data.url) {
      console.error('Invalid response from Outlook OAuth service:', data);
      throw new Error('Invalid response from Outlook OAuth service. Please ensure all required environment variables are set.');
    }
    
    return data.url;
  } catch (error: any) {
    console.error('Outlook authorization error:', error);
    throw error;
  }
};

export const exchangeGmailCode = async (code: string, userId: string): Promise<any> => {
  try {
    console.log('Exchanging Gmail authorization code for tokens');
    const { data, error } = await supabase.functions.invoke('gmail-auth', {
      body: { 
        action: 'token',
        code,
        userId
      },
    });

    console.log('Gmail token exchange response:', data);

    if (error) {
      console.error('Gmail token exchange error:', error);
      throw new Error(`Failed to exchange Gmail code: ${error.message}`);
    }
    
    if (!data || !data.success) {
      console.error('Gmail token exchange failed:', data);
      const errorMessage = data?.error || 'Failed to exchange Gmail authorization code';
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error exchanging Gmail code:', error);
    throw error;
  }
};

export const exchangeOutlookCode = async (code: string, userId: string): Promise<any> => {
  try {
    console.log('Exchanging Outlook authorization code for tokens');
    const { data, error } = await supabase.functions.invoke('outlook-auth', {
      body: { 
        action: 'token',
        code,
        userId
      },
    });

    console.log('Outlook token exchange response:', data);

    if (error) {
      console.error('Outlook token exchange error:', error);
      throw new Error(`Failed to exchange Outlook code: ${error.message}`);
    }
    
    if (!data || !data.success) {
      console.error('Outlook token exchange failed:', data);
      throw new Error(data?.error || 'Failed to exchange Outlook authorization code');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error exchanging Outlook code:', error);
    throw error;
  }
};

export const fetchGmailEmails = async (integrationId: string, count = 100): Promise<EmailMessage[]> => {
  try {
    console.log('Fetching Gmail emails for integration:', integrationId);
    const { data, error } = await supabase.functions.invoke('gmail-auth', {
      body: { 
        action: 'fetch',
        integrationId,
        count
      },
    });

    console.log('Gmail emails fetch response:', data);

    if (error) {
      console.error('Gmail emails fetch error:', error);
      throw new Error(`Failed to fetch Gmail emails: ${error.message}`);
    }
    
    if (!data || !data.success) {
      console.error('Gmail emails fetch failed:', data);
      throw new Error(data?.error || 'Failed to fetch Gmail emails');
    }
    
    // Transform emails to match our EmailMessage type
    return data.emails.map((email: any) => ({
      id: email.id,
      user_id: '', // Will be filled when saving to DB
      subject: email.subject,
      body: email.body,
      sender: email.from,
      recipient: email.to,
      received_date: email.date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error('Error fetching Gmail emails:', error);
    throw error;
  }
};

export const fetchOutlookEmails = async (integrationId: string, count = 100): Promise<EmailMessage[]> => {
  try {
    console.log('Fetching Outlook emails for integration:', integrationId);
    const { data, error } = await supabase.functions.invoke('outlook-auth', {
      body: { 
        action: 'fetch',
        integrationId,
        count
      },
    });

    console.log('Outlook emails fetch response:', data);

    if (error) {
      console.error('Outlook emails fetch error:', error);
      throw new Error(`Failed to fetch Outlook emails: ${error.message}`);
    }
    
    if (!data || !data.success) {
      console.error('Outlook emails fetch failed:', data);
      throw new Error(data?.error || 'Failed to fetch Outlook emails');
    }
    
    // Transform emails to match our EmailMessage type
    return data.emails.map((email: any) => ({
      id: email.id,
      user_id: '', // Will be filled when saving to DB
      subject: email.subject,
      body: email.body,
      sender: email.from,
      recipient: email.to,
      received_date: email.date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error('Error fetching Outlook emails:', error);
    throw error;
  }
};
