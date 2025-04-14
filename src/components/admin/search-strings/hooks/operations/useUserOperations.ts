
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchString } from '@/hooks/search-strings/search-string-types';

export const useUserOperations = () => {
  const { toast } = useToast();

  // Function to check a specific user's search strings by email
  const checkSpecificUser = async (
    email: string = 's.naeb@flh-mediadigital.de',
    setSearchStrings: (strings: SearchString[]) => void,
    setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setIsRefreshing: (isRefreshing: boolean) => void,
    setError: (error: string | null) => void
  ) => {
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
        
        // Even though we didn't find the user, let's try a direct search in the search_strings table
        // by checking for search strings with a similar email pattern
        console.log(`Attempting direct search in search_strings for email pattern: ${email}`);
        const { data: directSearchData, error: directSearchError } = await supabase
          .from('search_strings')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!directSearchError && directSearchData && directSearchData.length > 0) {
          console.log(`Found ${directSearchData.length} search strings in total`);
          
          // Display all search strings instead
          setSearchStrings(directSearchData || []);
          toast({
            title: 'Showing all search strings',
            description: `Could not find user with email ${email}, showing all ${directSearchData.length} search strings instead`,
            variant: 'default',
          });
        }
        
        return;
      }

      const userId = userData[0].user_id;
      console.log(`Found user ID ${userId} for email ${email}`);
      
      // Now get all search strings for this user
      console.log(`Fetching search strings for user ID: ${userId}`);
      
      // Set up user email mapping right away to ensure we have it
      setUserEmails((prev) => {
        const newMapping = { ...prev };
        newMapping[userId] = email;
        return newMapping;
      });
      
      // First try a direct match
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
      
      if (!stringData || stringData.length === 0) {
        // If no direct matches, try a case-insensitive search as a fallback
        console.log(`No exact matches found. Trying case-insensitive search...`);
        const { data: allStrings, error: allStringsError } = await supabase
          .from('search_strings')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!allStringsError && allStrings) {
          // Filter client-side for case-insensitive user_id match
          const caseInsensitiveMatches = allStrings.filter(
            s => s.user_id && s.user_id.toLowerCase() === userId.toLowerCase()
          );
          
          if (caseInsensitiveMatches.length > 0) {
            console.log(`Found ${caseInsensitiveMatches.length} search strings with case-insensitive user ID match`);
            setSearchStrings(caseInsensitiveMatches);
            
            // Update user emails mapping with the actual case used in the database
            const firstMatch = caseInsensitiveMatches[0];
            if (firstMatch.user_id) {
              setUserEmails((prev) => {
                const newMapping = { ...prev };
                newMapping[firstMatch.user_id] = email;
                return newMapping;
              });
            }
            
            toast({
              title: 'Search strings found',
              description: `Found ${caseInsensitiveMatches.length} search strings with case-insensitive user ID match`,
              variant: 'default'
            });
          } else {
            setSearchStrings([]);
            setError(`No search strings found for user ID "${userId}" (${email}). This could indicate that the search strings were created with a different user account.`);
          }
        }
      } else {
        // Set the search strings directly so we only see this user's strings
        setSearchStrings(stringData || []);
      }
      
      // Show success message
      toast({
        title: 'User search strings loaded',
        description: `Found ${stringData?.length || 0} search strings for ${email}`,
        variant: stringData?.length ? 'default' : 'destructive'
      });
      
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

  const debugUser = async (email: string) => {
    try {
      // First get user ID from email
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('user_id, email, company_id')
        .eq('email', email)
        .limit(1);

      if (userError) {
        return { error: `Error finding user: ${userError.message}` };
      }

      if (!userData || userData.length === 0) {
        return { error: `User with email ${email} not found in company_users table` };
      }

      const userId = userData[0].user_id;
      
      // Now check for search strings with this ID
      const { data: stringsData, error: stringsError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('user_id', userId);
        
      if (stringsError) {
        return { 
          user: userData[0],
          error: `Error finding search strings: ${stringsError.message}`
        };
      }
      
      // Try case-insensitive search as well
      const { data: caseInsensitiveStrings, error: caseInsensitiveError } = await supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });

      let caseInsensitiveMatches = [];
      if (!caseInsensitiveError && caseInsensitiveStrings) {
        caseInsensitiveMatches = caseInsensitiveStrings.filter(
          s => s.user_id && s.user_id.toLowerCase() === userId.toLowerCase()
        );
      }

      // Also check for ALL search strings
      const { data: allStrings, error: allStringsError } = await supabase
        .from('search_strings')
        .select('*')
        .limit(100);

      // Check for auth.users record
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      return {
        user: userData[0],
        searchStrings: stringsData || [],
        caseInsensitiveMatches: caseInsensitiveMatches.length > 0 ? caseInsensitiveMatches : null,
        authUser: authUser?.user || null,
        allStringsCount: allStrings?.length || 0,
        allStrings: allStrings?.map(s => ({ 
          id: s.id, 
          user_id: s.user_id, 
          input_source: s.input_source,
          user_id_lowercase: s.user_id ? s.user_id.toLowerCase() : null,
          matches_user: s.user_id ? s.user_id.toLowerCase() === userId.toLowerCase() : false
        }))
      };
    } catch (err: any) {
      return { error: `Unexpected error: ${err.message}` };
    }
  };

  return { checkSpecificUser, debugUser };
};
