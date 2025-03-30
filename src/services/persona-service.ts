
import { supabase } from '@/integrations/supabase/client';
import { AIPersona } from '@/types/persona';

export const fetchPersonas = async (): Promise<AIPersona[]> => {
  const { data, error } = await supabase
    .from('ai_personas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching personas:', error);
    throw error;
  }

  console.log('Fetched personas:', data);
  return data || [];
};

export const createPersona = async (
  persona: Omit<AIPersona, 'id' | 'user_id' | 'created_at' | 'updated_at'>, 
  userId: string
): Promise<AIPersona> => {
  console.log('Creating persona with data:', persona);
  
  const newPersona = {
    ...persona,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('ai_personas')
    .insert([newPersona])
    .select()
    .single();

  if (error) {
    console.error('Error creating persona:', error);
    throw error;
  }

  console.log('Created persona:', data);
  return data;
};

export const updatePersona = async ({ id, ...persona }: Partial<AIPersona> & { id: string }): Promise<AIPersona> => {
  console.log('Updating persona:', id, persona);
  
  const { data, error } = await supabase
    .from('ai_personas')
    .update(persona)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating persona:', error);
    throw error;
  }

  console.log('Updated persona:', data);
  return data;
};

export const deletePersona = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_personas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting persona:', error);
    throw error;
  }
};
