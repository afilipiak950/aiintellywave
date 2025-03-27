
import { supabase } from '@/integrations/supabase/client';
import { EmailContact } from '@/types/persona';

export const fetchEmailContacts = async (): Promise<EmailContact[]> => {
  const { data, error } = await supabase
    .from('email_contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching email contacts:', error);
    throw error;
  }

  return data || [];
};

export const createEmailContacts = async (
  contacts: Omit<EmailContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>[],
  userId: string
): Promise<EmailContact[]> => {
  const newContacts = contacts.map(contact => ({
    ...contact,
    user_id: userId,
  }));

  const { data, error } = await supabase
    .from('email_contacts')
    .insert(newContacts)
    .select();

  if (error) {
    console.error('Error creating email contacts:', error);
    throw error;
  }

  return data || [];
};
