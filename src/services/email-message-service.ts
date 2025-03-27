
import { supabase } from '@/integrations/supabase/client';
import { EmailMessage, EmailAnalysis } from '@/types/persona';

export const fetchEmailMessages = async (): Promise<EmailMessage[]> => {
  const { data, error } = await supabase
    .from('email_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching email messages:', error);
    throw error;
  }

  return data || [];
};

export const createEmailMessage = async (
  message: Omit<EmailMessage, 'id' | 'user_id' | 'created_at' | 'updated_at'>, 
  userId: string
): Promise<EmailMessage> => {
  const newMessage = {
    ...message,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('email_messages')
    .insert([newMessage])
    .select()
    .single();

  if (error) {
    console.error('Error creating email message:', error);
    throw error;
  }

  return data;
};

export const fetchEmailAnalysis = async (emailId: string): Promise<EmailAnalysis | null> => {
  const { data, error } = await supabase
    .from('email_analysis')
    .select('*')
    .eq('email_id', emailId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No analysis found for this email
      return null;
    }
    console.error('Error fetching email analysis:', error);
    throw error;
  }

  // Convert the data to match our EmailAnalysis interface
  return data as EmailAnalysis;
};

export const createEmailAnalysis = async (
  analysis: Omit<EmailAnalysis, 'id' | 'created_at' | 'updated_at'>
): Promise<EmailAnalysis> => {
  const { data, error } = await supabase
    .from('email_analysis')
    .insert([analysis])
    .select()
    .single();

  if (error) {
    console.error('Error creating email analysis:', error);
    throw error;
  }

  // Convert the data to match our EmailAnalysis interface
  return data as EmailAnalysis;
};

// Function to save imported emails to the database
export const saveImportedEmails = async (
  emails: Omit<EmailMessage, 'user_id'>[],
  userId: string
): Promise<EmailMessage[]> => {
  // Add user_id to each email
  const emailsWithUserId = emails.map(email => ({
    ...email,
    user_id: userId
  }));
  
  // Insert in batches to avoid hitting size limits
  const results: EmailMessage[] = [];
  const batchSize = 50;
  
  for (let i = 0; i < emailsWithUserId.length; i += batchSize) {
    const batch = emailsWithUserId.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('email_messages')
      .insert(batch)
      .select();
    
    if (error) {
      console.error('Error importing emails batch:', error);
      throw error;
    }
    
    results.push(...data);
  }
  
  return results;
};

// Add an alias for backward compatibility
export const saveEmailMessages = saveImportedEmails;
