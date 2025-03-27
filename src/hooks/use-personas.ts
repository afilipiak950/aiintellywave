
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIPersona, EmailIntegration, EmailContact } from '@/types/persona';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

export const usePersonas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchPersonas = async (): Promise<AIPersona[]> => {
    const { data, error } = await supabase
      .from('ai_personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching personas:', error);
      throw error;
    }

    return data || [];
  };

  const createPersona = async (persona: Omit<AIPersona, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AIPersona> => {
    if (!user) throw new Error('User not authenticated');

    const newPersona = {
      ...persona,
      user_id: user.id,
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

    return data;
  };

  const updatePersona = async ({ id, ...persona }: Partial<AIPersona> & { id: string }): Promise<AIPersona> => {
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

    return data;
  };

  const deletePersona = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('ai_personas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  };

  // Email integrations
  const fetchEmailIntegrations = async (): Promise<EmailIntegration[]> => {
    const { data, error } = await supabase
      .from('email_integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email integrations:', error);
      throw error;
    }

    return data || [];
  };

  const createEmailIntegration = async (integration: Omit<EmailIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EmailIntegration> => {
    if (!user) throw new Error('User not authenticated');

    const newIntegration = {
      ...integration,
      user_id: user.id,
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

    return data;
  };

  // Email contacts
  const fetchEmailContacts = async (): Promise<EmailContact[]> => {
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

  const createEmailContacts = async (contacts: Omit<EmailContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<EmailContact[]> => {
    if (!user) throw new Error('User not authenticated');

    const newContacts = contacts.map(contact => ({
      ...contact,
      user_id: user.id,
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

  // Queries and mutations
  const personasQuery = useQuery({
    queryKey: ['personas'],
    queryFn: fetchPersonas,
    enabled: !!user,
  });

  const emailIntegrationsQuery = useQuery({
    queryKey: ['emailIntegrations'],
    queryFn: fetchEmailIntegrations,
    enabled: !!user,
  });

  const emailContactsQuery = useQuery({
    queryKey: ['emailContacts'],
    queryFn: fetchEmailContacts,
    enabled: !!user,
  });

  const createPersonaMutation = useMutation({
    mutationFn: createPersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast({
        title: 'Success',
        description: 'Persona created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create persona: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updatePersonaMutation = useMutation({
    mutationFn: updatePersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast({
        title: 'Success',
        description: 'Persona updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update persona: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deletePersonaMutation = useMutation({
    mutationFn: deletePersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast({
        title: 'Success',
        description: 'Persona deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete persona: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const createEmailIntegrationMutation = useMutation({
    mutationFn: createEmailIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailIntegrations'] });
      toast({
        title: 'Success',
        description: 'Email integration created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create email integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const createEmailContactsMutation = useMutation({
    mutationFn: createEmailContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailContacts'] });
      toast({
        title: 'Success',
        description: 'Email contacts added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add email contacts: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    personas: personasQuery.data || [],
    emailIntegrations: emailIntegrationsQuery.data || [],
    emailContacts: emailContactsQuery.data || [],
    isLoading: personasQuery.isLoading,
    isError: personasQuery.isError,
    createPersona: createPersonaMutation.mutate,
    updatePersona: updatePersonaMutation.mutate,
    deletePersona: deletePersonaMutation.mutate,
    createEmailIntegration: createEmailIntegrationMutation.mutate,
    createEmailContacts: createEmailContactsMutation.mutate,
  };
};
