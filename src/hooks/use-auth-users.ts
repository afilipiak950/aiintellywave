
import { useState, useEffect } from 'react';
import { fetchAuthUsers } from '@/services/userService';
import { AuthUser } from '@/services/types/customerTypes';

export function useAuthUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchAllUsers();
  }, []);
  
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const authUsers = await fetchAuthUsers();
      setUsers(authUsers);
    } catch (error: any) {
      console.error('Error in useAuthUsers:', error);
      setErrorMsg(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter users by search term (email or name)
  const filteredUsers = users.filter(user => {
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
    refreshUsers: fetchAllUsers,
    fetchAuthUsers // Add this to expose the fetchAuthUsers function
  };
}
