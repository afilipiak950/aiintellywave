import { supabase } from '@/integrations/supabase/client';
import { EmailMessage } from '@/types/persona';

export const authorizeGmail = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('gmail-auth', {
      body: { action: 'authorize' },
    });

    if (error) throw error;
    if (!data || !data.url) throw new Error('Invalid response from Gmail OAuth service');
    return data.url;
  } catch (error: any) {
    console.error('Gmail authorization error:', error);
    throw error;
  }
};

export const authorizeOutlook = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('outlook-auth', {
      body: { action: 'authorize' },
    });

    if (error) {
      console.error('Outlook authorization error:', error);
      throw error;
    }
    
    if (!data || !data.url) {
      throw new Error('Invalid response from Outlook OAuth service. Please ensure all required environment variables are set.');
    }
    
    return data.url;
  } catch (error: any) {
    console.error('Outlook authorization error:', error);
    throw error;
  }
};

export const exchangeGmailCode = async (code: string, userId: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('gmail-auth', {
    body: { 
      action: 'token',
      code,
      userId
    },
  });

  if (error) throw error;
  return data;
};

export const exchangeOutlookCode = async (code: string, userId: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('outlook-auth', {
    body: { 
      action: 'token',
      code,
      userId
    },
  });

  if (error) throw error;
  return data;
};

export const fetchGmailEmails = async (integrationId: string, count = 100): Promise<EmailMessage[]> => {
  const { data, error } = await supabase.functions.invoke('gmail-auth', {
    body: { 
      action: 'fetch',
      integrationId,
      count
    },
  });

  if (error) throw error;
  
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
};

export const fetchOutlookEmails = async (integrationId: string, count = 100): Promise<EmailMessage[]> => {
  const { data, error } = await supabase.functions.invoke('outlook-auth', {
    body: { 
      action: 'fetch',
      integrationId,
      count
    },
  });

  if (error) throw error;
  
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
};
