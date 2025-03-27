
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { 
  fetchEmailContacts, 
  createEmailContacts 
} from '@/services/email-contact-service';
import { EmailContact } from '@/types/persona';

export const useEmailContacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const emailContactsQuery = useQuery({
    queryKey: ['emailContacts'],
    queryFn: fetchEmailContacts,
    enabled: !!user,
  });

  // Mutations
  const createEmailContactsMutation = useMutation({
    mutationFn: (contacts: Omit<EmailContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
      if (!user) throw new Error('User not authenticated');
      return createEmailContacts(contacts, user.id);
    },
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
    emailContacts: emailContactsQuery.data || [],
    isLoading: emailContactsQuery.isLoading,
    isError: emailContactsQuery.isError,
    createEmailContacts: createEmailContactsMutation.mutate,
  };
};
