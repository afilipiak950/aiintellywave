
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchString } from '@/hooks/search-strings/search-string-types';

/**
 * Utilities for searching and filtering search strings by user
 */
export const checkSpecificUser = async (
  email: string = 's.naeb@flh-mediadigital.de',
  setSearchStrings: (strings: SearchString[]) => void,
  setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setIsRefreshing: (isRefreshing: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { toast } = useToast();

  try {
    setIsRefreshing(true);
    setError(null);
    
    // First get the user ID from their email
    console.log(`Admin: Checking search strings for user with email: ${email}`);
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('user_id, email, company_id, role')
      .eq('email', email)
      .limit(1);
    
    if (userError) {
      console.error('Error finding user by email:', userError);
      setError(`Failed to find user with email ${email}: ${userError.message}`);
      return;
    }
    
    if (!userData || userData.length === 0) {
      console.error(`User with email ${email} not found`);
      setError(`User with email ${email} not found in company_users table. The user might exist in auth.users but not have a company_users entry.`);
      toast({
        title: 'User not found',
        description: `User with email ${email} was not found in company_users table`,
        variant: 'destructive',
      });
      
      return;
    }

    const userId = userData[0].user_id;
    console.log(`Found user ID ${userId} for email ${email}`);
    
    // Set up user email mapping right away to ensure we have it
    setUserEmails((prev) => {
      const newMapping = { ...prev };
      newMapping[userId] = email;
      return newMapping;
    });
    
    // Now get all search strings for this user
    console.log(`Fetching search strings for user ID: ${userId}`);
    
    const { data: stringData, error: stringError } = await supabase
      .from('search_strings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (stringError) {
      console.error('Error fetching user search strings:', stringError);
      setError(`Failed to load search strings for user: ${stringError.message}`);
      return;
    }
    
    console.log(`Found ${stringData?.length || 0} search strings for user ID ${userId}`);
    
    // Set the search strings directly - empty array is valid!
    setSearchStrings(stringData || []);
    
    // Show appropriate message based on if we found any strings
    if (!stringData || stringData.length === 0) {
      toast({
        title: 'User search complete',
        description: `No search strings found for user ${email}`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'User search strings loaded',
        description: `Found ${stringData.length} search strings for ${email}`,
        variant: 'default'
      });
    }
    
    // Also fetch company details if needed
    if (userData[0].company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', userData[0].company_id)
        .limit(1);
        
      if (companyData && companyData.length > 0) {
        setCompanyNames((prev) => {
          const newMapping = { ...prev };
          newMapping[companyData[0].id] = companyData[0].name;
          return newMapping;
        });
      }
    }
    
  } catch (error: any) {
    console.error('Error in checkSpecificUser:', error);
    setError(`Unexpected error checking user: ${error.message || 'Unknown error'}`);
  } finally {
    setIsRefreshing(false);
  }
};
