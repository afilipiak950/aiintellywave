
import { useToast } from '@/hooks/use-toast';
import { checkSpecificUser } from './user/userSearchOperations';
import { debugUser } from './user/userDebugOperations';

/**
 * Hook for user-related operations in the search strings admin interface
 */
export const useUserOperations = () => {
  const { toast } = useToast();

  return { 
    checkSpecificUser, 
    debugUser 
  };
};
