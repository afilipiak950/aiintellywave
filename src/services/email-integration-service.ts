
import { supabase } from '@/integrations/supabase/client';
import { EmailIntegration } from '@/types/persona';

export const fetchEmailIntegrations = async (): Promise<EmailIntegration[]> => {
  const { data, error } = await supabase
    .from('email_integrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching email integrations:', error);
    throw error;
  }

  // Type cast the provider to ensure it matches our union type
  return (data || []).map(item => ({
    ...item,
    provider: item.provider as EmailIntegration['provider']
  }));
};

export const createEmailIntegration = async (
  integration: Omit<EmailIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  userId: string
): Promise<EmailIntegration> => {
  const newIntegration = {
    ...integration,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('email_integrations')
    .insert([newIntegration])
    .select()
    .single();

  if (error) {
    console.error('Error creating email integration:', error);
    throw error;
  }

  // Type cast the provider to ensure it matches our union type
  return {
    ...data,
    provider: data.provider as EmailIntegration['provider']
  };
};
