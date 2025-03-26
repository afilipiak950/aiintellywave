import { useState, useEffect } from 'react';
import { fetchAuthUsers } from '@/services/userService';
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
      setLoading(true);
      setErrorMsg(null);
      
      console.log('useAuthUsers: Fetching users...');
      const authUsers = await fetchAuthUsers();
      console.log(`useAuthUsers: Fetched ${authUsers.length} users`);
      setUsers(authUsers);
    } catch (error: any) {
      console.error('Error in useAuthUsers:', error);
      setErrorMsg(error.message || 'Failed to load users');
      
      // Show toast notification for the error
      toast({
        title: "Error Loading Users",
        description: error.message || 'Failed to load users',
        variant: "destructive"
      });
      
      // Even if we get an error, we'll keep the existing users if available
      // This prevents the UI from showing zero users when there's a fetch error
    } finally {
      setLoading(false);
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
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const fullName = user.user_metadata?.name || `${firstName} ${lastName}`.trim();
    
    if (fullName.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });
  
  return {
    users: filteredUsers,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    refreshUsers: fetchAllUsers
  };
}
