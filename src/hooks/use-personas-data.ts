
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { 
  fetchPersonas, 
  createPersona, 
  updatePersona, 
  deletePersona 
} from '@/services/persona-service';
import { AIPersona } from '@/types/persona';

export const usePersonasData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const personasQuery = useQuery({
    queryKey: ['personas'],
    queryFn: fetchPersonas,
    enabled: !!user,
  });

  // Mutations
  const createPersonaMutation = useMutation({
    mutationFn: (persona: Omit<AIPersona, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return createPersona(persona, user.id);
    },
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

  return {
    personas: personasQuery.data || [],
    isLoading: personasQuery.isLoading,
    isError: personasQuery.isError,
    createPersona: createPersonaMutation.mutate,
    updatePersona: updatePersonaMutation.mutate,
    deletePersona: deletePersonaMutation.mutate,
  };
};
