
import { SearchStringType, SearchStringSource } from '../search-string-types';

export const useSearchStringSubmission = ({
  user,
  isAuthenticated,
  setIsSubmitting,
  inputSource,
  inputText,
  inputUrl,
  selectedFile,
  createSearchString,
  setInputText,
  setInputUrl,
  setSelectedFile,
  setPreviewString,
  onError,
  toast,
  type
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      const errorMsg = "You must be logged in to create search strings";
      console.error(errorMsg);
      toast({
        title: "Authorization Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'text' && !inputText) {
      const errorMsg = "Please enter text to generate a search string";
      console.error(errorMsg);
      toast({
        title: "Input Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'website' && !inputUrl) {
      const errorMsg = "Please enter a URL to generate a search string";
      console.error(errorMsg);
      toast({
        title: "URL Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'pdf' && !selectedFile) {
      const errorMsg = "Please upload a PDF file to generate a search string";
      console.error(errorMsg);
      toast({
        title: "File Required",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onError) onError(null);
      
      console.log('Creating search string with user info:', {
        userId: user.id,
        userEmail: user.email || 'No email',
        userRole: user.role || 'No role',
        isAdmin: user.is_admin || false,
        isManager: user.is_manager || false,
        isCustomer: user.is_customer || false,
        companyId: user.company_id || 'No company ID'
      });
      
      // Add more debugging for the createSearchString parameters
      console.log('Search string parameters:', {
        type,
        inputSource, 
        inputText: inputSource === 'text' ? (inputText?.substring(0, 50) + '...') : undefined,
        inputUrl: inputSource === 'website' ? inputUrl : undefined,
        fileProvided: inputSource === 'pdf' ? !!selectedFile : false,
        fileName: inputSource === 'pdf' && selectedFile ? selectedFile.name : null
      });
      
      const result = await createSearchString(
        user, 
        type, 
        inputSource, 
        inputSource === 'text' ? inputText : undefined,
        inputSource === 'website' ? inputUrl : undefined,
        inputSource === 'pdf' ? selectedFile : null
      );
      
      if (result) {
        console.log('Search string created successfully with result:', result);
        
        setInputText('');
        setInputUrl('');
        setSelectedFile(null);
        setPreviewString(null);
        
        toast({
          title: "Success",
          description: "Search string has been created and is being processed."
        });
      } else {
        console.error('Search string creation returned falsy result');
        if (onError) onError('Search string creation returned unexpected result');
        
        toast({
          title: "Warning",
          description: "Search string may not have been created properly. Please check the list below.",
          variant: "warning"
        });
      }
    } catch (error) {
      console.error('Error creating search string:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (typeof errorMessage === 'string' && errorMessage.includes('Could not find the \'progress\' column')) {
        const detailedError = "Database schema error: The progress column is missing. Please contact the administrator.";
        console.error(detailedError, {
          userId: user.id,
          error: errorMessage
        });
        
        if (onError) onError(detailedError);
        toast({
          title: "Database Error",
          description: "There's a problem with the database structure. Please try again later or contact support.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('row-level security') || errorMessage.includes('permission denied') || errorMessage.includes('infinite recursion')) {
        const detailedError = "Datenbank-Richtlinienfehler: Bitte melden Sie sich ab und wieder an.";
        console.error(detailedError, {
          userId: user.id,
          error: errorMessage
        });
        
        localStorage.setItem('auth_policy_error', 'true');
        
        if (onError) onError(detailedError);
        toast({
          title: "Datenbank-Richtlinienfehler",
          description: "Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.",
          variant: "destructive"
        });
      } else {
        if (onError) onError(`Failed to create search string: ${errorMessage}`);
        toast({
          title: "Error",
          description: `Failed to create search string: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit
  };
};
