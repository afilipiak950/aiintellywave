
import { useState, useEffect } from 'react';
import { fetchAuthUsers } from '@/services/auth/authUserService';
import { AuthUser } from '@/services/types/customerTypes';
import { toast } from '@/hooks/use-toast';

export function useAuthUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    console.log('useAuthUsers: Initial fetch started');
    fetchAllUsers();
  }, []);
  
  const fetchAllUsers = async () => {
    try {
      console.log('useAuthUsers: Fetching users started...');
      setLoading(true);
      setErrorMsg(null);
      
      const authUsers = await fetchAuthUsers();
      console.log(`useAuthUsers: Fetched ${authUsers.length} users successfully`);
      
      if (authUsers.length === 0) {
        console.warn('No auth users were found');
        toast({
          title: "No users found",
          description: "The system did not return any users. Attempting alternative methods...",
          variant: "default"
        });
        
        // Try one more time with a short delay
        setTimeout(async () => {
          try {
            const retryUsers = await fetchAuthUsers();
            if (retryUsers.length > 0) {
              console.log(`useAuthUsers: Retry successful, got ${retryUsers.length} users`);
              setUsers(retryUsers);
              toast({
                title: "Users loaded",
                description: `Successfully loaded ${retryUsers.length} users after retry.`,
                variant: "default"
              });
            }
          } catch (retryErr) {
            console.error('Error in retry:', retryErr);
          } finally {
            setLoading(false);
          }
        }, 2000);
      }
      
      setUsers(authUsers);
    } catch (error: any) {
      console.error('Error in useAuthUsers:', error);
      setErrorMsg(error.message || 'Failed to load users');
      
      // Show toast notification for the error
      toast({
        title: "Error Loading Users",
        description: error.message || 'Failed to load users. Will try alternative sources.',
        variant: "destructive"
      });
      
      // Even if we get an error, we'll keep the existing users if available
    } finally {
      setLoading(false);
      console.log('useAuthUsers: Fetch completed, loading set to false');
    }
  };
  
  // Filter users by search term (email or name)
  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search by email
    if (user.email && user.email.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search by first name or last name in user_metadata if available
    const firstName = user.user_metadata?.first_name || user.first_name || '';
    const lastName = user.user_metadata?.last_name || user.last_name || '';
    const fullName = user.user_metadata?.name || user.full_name || `${firstName} ${lastName}`.trim();
    
    if (fullName.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search by role
    const role = user.user_metadata?.role || user.role || '';
    if (role.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });
  
  console.log('useAuthUsers: Returning', filteredUsers.length, 'filtered users out of', users.length, 'total');
  
  return {
    users: filteredUsers,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    refreshUsers: fetchAllUsers
  };
}
